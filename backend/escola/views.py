from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Count, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Atividade, Resposta
from .serializers import (
    AtividadeSerializer, 
    RespostaAlunoSerializer, 
    RespostaProfessorSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsProfessor, IsAluno
from drf_spectacular.utils import extend_schema

# ==========================================
# ENDPOINTS DE ATIVIDADES
# ==========================================

class MeAtividadesView(generics.ListAPIView):
    """
    GET /me/atividades
    ALUNO: atividades direcionadas à turma que está incluído
    PROFESSOR: Atividades que o professor criou
    """
    serializer_class = AtividadeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PROFESSOR':
            return Atividade.objects.filter(professor=user).order_by('-id')
        elif user.role == 'ALUNO':
            if not user.turma:
                return Atividade.objects.none() # Aluno sem turma não vê nada
            return Atividade.objects.filter(turma=user.turma).order_by('-id')
        return Atividade.objects.none()


class AtividadeCreateView(generics.CreateAPIView):
    """
    POST /atividades
    Apenas PROFESSOR pode criar.
    """
    queryset = Atividade.objects.all()
    serializer_class = AtividadeSerializer
    permission_classes = [IsProfessor]

    def perform_create(self, serializer):
        # Injeta o professor logado automaticamente na atividade antes de salvar
        serializer.save(professor=self.request.user)


# ==========================================
# ENDPOINTS DE RESPOSTAS
# ==========================================

class RespostaCreateView(generics.CreateAPIView):
    """ POST /respostas (Somente ALUNO) """
    serializer_class = RespostaAlunoSerializer
    permission_classes = [IsAluno]

    def perform_create(self, serializer):
        atividade = serializer.validated_data['atividade']
        aluno = self.request.user

        # Regra 1: O Aluno não pode acessar atividade de outra turma
        if atividade.turma != aluno.turma:
            raise PermissionDenied("Você não pode responder atividades de outra turma.")

        # Regra 2: O Aluno não pode enviar mais de uma resposta para a mesma atividade
        if Resposta.objects.filter(aluno=aluno, atividade=atividade).exists():
            raise ValidationError("Você já enviou uma resposta para esta atividade.")

        serializer.save(aluno=aluno)


class MeRespostasView(generics.ListAPIView):
    """ GET /me/respostas (Somente ALUNO) """
    serializer_class = RespostaAlunoSerializer
    permission_classes = [IsAluno]
    pagination_class = None # Desativa paginação para esta view, já que o número de respostas por aluno é pequeno

    def get_queryset(self):
        # Lista respostas já enviadas pelo aluno logado
        return Resposta.objects.filter(aluno=self.request.user).order_by('-id')


class AtividadeRespostasView(generics.ListAPIView):
    """ GET /atividades/{id}/respostas/ (PROFESSOR: respostas dos alunos) """
    serializer_class = RespostaAlunoSerializer 
    permission_classes = [IsProfessor]

    def get_queryset(self):
        atividade_id = self.kwargs['id']
        atividade = get_object_or_404(Atividade, id=atividade_id)

        # Regra 3: O Professor só pode corrigir atividades que criou
        if atividade.professor != self.request.user:
            raise PermissionDenied("Você só tem permissão para ver respostas de atividades que você criou.")

        return Resposta.objects.filter(atividade=atividade).order_by('-id')


class RespostaUpdateView(generics.UpdateAPIView):
    """ PATCH /respostas/{id}/ (ALUNO e PROFESSOR) """
    permission_classes = [permissions.IsAuthenticated]
    queryset = Resposta.objects.all()
    http_method_names = ['patch']
    lookup_field = 'id'

    def get_serializer_class(self):
        # O DRF decide dinamicamente qual formato de dados exigir baseado em quem está logado
        if self.request.user.role == 'PROFESSOR':
            return RespostaProfessorSerializer
        return RespostaAlunoSerializer

    def perform_update(self, serializer):
        resposta = self.get_object()
        user = self.request.user

        if user.role == 'ALUNO':
            if resposta.aluno != user:
                raise PermissionDenied("Você só pode editar sua própria resposta.")
            
            # Regra 4: O Aluno pode alterar a resposta antes da data de entrega
            if resposta.atividade.data_entrega < timezone.now():
                raise PermissionDenied("O prazo de entrega desta atividade já encerrou.")
            
            serializer.save()

        elif user.role == 'PROFESSOR':
            # Regra 5: O Professor só pode corrigir atividades que criou
            if resposta.atividade.professor != user:
                raise PermissionDenied("Você não pode dar nota em uma atividade de outro professor.")
            
            serializer.save()

# ==========================================
# DASHBOARD
# ==========================================
class ProfessorDashboardView(APIView):
    """ GET /me/dashboard/ (Somente PROFESSOR) """
    permission_classes = [IsProfessor]

    @extend_schema(
        summary="Métricas do Professor",
        description="Retorna o total de atividades criadas, total de respostas recebidas e a média geral das notas dadas pelo professor logado.",
        tags=["Dashboard"]
    )

    def get(self, request):
        user = request.user
        
        # 1. Quantas atividades esse professor criou?
        total_atividades = Atividade.objects.filter(professor=user).count()
        
        # 2. Quantas respostas os alunos enviaram para as atividades dele?
        total_respostas = Resposta.objects.filter(atividade__professor=user).count()
        
        # 3. Qual a média geral das notas dadas por ele?
        media_notas = Resposta.objects.filter(atividade__professor=user).aggregate(media=Avg('nota'))['media']

        return Response({
            'total_atividades': total_atividades,
            'total_respostas': total_respostas,
            # Se a média for None (nenhuma nota dada ainda), retornamos 0
            'media_notas_geral': round(media_notas, 2) if media_notas else 0.0
        })

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /auth/login/
    View customizada para retornar o JWT com 'role' e 'username' embutidos.
    """
    serializer_class = CustomTokenObtainPairSerializer
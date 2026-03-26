from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Atividade, Resposta
from .serializers import AtividadeSerializer, RespostaAlunoSerializer, RespostaProfessorSerializer
from .permissions import IsProfessor, IsAluno

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
            return Atividade.objects.filter(professor=user)
        elif user.role == 'ALUNO':
            if not user.turma:
                return Atividade.objects.none() # Aluno sem turma não vê nada
            return Atividade.objects.filter(turma=user.turma)
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

    def get_queryset(self):
        # Lista respostas já enviadas pelo aluno logado
        return Resposta.objects.filter(aluno=self.request.user)


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

        return Resposta.objects.filter(atividade=atividade)


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
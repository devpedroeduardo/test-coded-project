from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Turma, Atividade, Resposta

class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ['id', 'nome']

class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        fields = ['id', 'titulo', 'descricao', 'turma', 'data_entrega', 'professor', 'arquivo']
        read_only_fields = ['professor'] 

class RespostaAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ['id', 'atividade', 'texto_resposta', 'arquivo', 'nota', 'feedback', 'criado_em']
        read_only_fields = ['nota', 'feedback', 'criado_em']

class RespostaProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ['id', 'nota', 'feedback']
        
    def validate_nota(self, value):
        if value is None:
            raise serializers.ValidationError("A nota é obrigatória na correção.")
        return value
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Injeta os dados extras que o Front-end em React precisa ler
        token['username'] = user.username
        token['role'] = user.role

        return token
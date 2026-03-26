from rest_framework import serializers
from .models import User, Turma, Atividade, Resposta

class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ['id', 'nome']

class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        fields = ['id', 'titulo', 'descricao', 'turma', 'data_entrega', 'professor']
        # O professor nunca é enviado no body da requisição, nós pegamos do token de quem está logado.
        read_only_fields = ['professor'] 

class RespostaAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ['id', 'atividade', 'texto_resposta', 'nota', 'feedback', 'criado_em']
        # Bloqueamos nota e feedback aqui, pois o aluno não pode se autoavaliar.
        read_only_fields = ['nota', 'feedback', 'criado_em']

class RespostaProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ['id', 'nota', 'feedback']
        
    def validate_nota(self, value):
        """Garante a regra: A nota deve estar entre 0 e 10. Nota é obrigatória."""
        if value is None:
            raise serializers.ValidationError("A nota é obrigatória na correção.")
        if value < 0 or value > 10:
            raise serializers.ValidationError("A nota deve estar entre 0 e 10.")
        return value
from rest_framework import serializers
from .models import User, Turma, Atividade, Resposta

class TurmaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turma
        fields = ['id', 'nome']

class AtividadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atividade
        # 👇 Adicionamos o 'arquivo' aqui na lista
        fields = ['id', 'titulo', 'descricao', 'turma', 'data_entrega', 'professor', 'arquivo']
        read_only_fields = ['professor'] 

class RespostaAlunoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        # 👇 Adicionamos o 'arquivo' aqui na lista também
        fields = ['id', 'atividade', 'texto_resposta', 'arquivo', 'nota', 'feedback', 'criado_em']
        read_only_fields = ['nota', 'feedback', 'criado_em']

class RespostaProfessorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resposta
        fields = ['id', 'nota', 'feedback']
        
    def validate_nota(self, value):
        # Apenas barramos a nota vazia. O limite de 0 a 10 já é feito pelo Models!
        if value is None:
            raise serializers.ValidationError("A nota é obrigatória na correção.")
        return value
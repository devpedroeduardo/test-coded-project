from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    class Role(models.TextChoices):
        PROFESSOR = 'PROFESSOR', 'Professor'
        ALUNO = 'ALUNO', 'Aluno'

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.ALUNO)
    # O Aluno deve estar em uma turma. Deixamos null=True pois o Professor não precisa de turma.
    turma = models.ForeignKey('Turma', on_delete=models.SET_NULL, null=True, blank=True, related_name='alunos')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Turma(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class Atividade(models.Model):
    professor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='atividades_criadas')
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, related_name='atividades')
    titulo = models.CharField(max_length=200)
    descricao = models.TextField()
    data_entrega = models.DateTimeField()

    def __str__(self):
        return self.titulo


class Resposta(models.Model):
    aluno = models.ForeignKey(User, on_delete=models.CASCADE, related_name='respostas')
    atividade = models.ForeignKey(Atividade, on_delete=models.CASCADE, related_name='respostas')
    texto_resposta = models.TextField()
    
    # Nota permite null inicialmente (quando o aluno envia), mas o validador garante o limite quando avaliado.
    nota = models.DecimalField(
        max_digits=4, 
        decimal_places=2, 
        null=True, 
        blank=True, 
        validators=[MinValueValidator(0), MaxValueValidator(10)]
    )
    feedback = models.TextField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        # Garante a regra: O Aluno não pode enviar mais de uma resposta para a mesma atividade.
        unique_together = ['aluno', 'atividade']

    def __str__(self):
        return f"Resposta de {self.aluno.username} para {self.atividade.titulo}"
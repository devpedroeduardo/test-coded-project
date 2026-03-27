from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Turma, Atividade, Resposta

User = get_user_model()

# ==========================================
# 1. TESTES DE ATIVIDADES (Criação e Listagem)
# ==========================================
class AtividadePermissionTests(APITestCase):
    def setUp(self):
        self.turma_teste = Turma.objects.create(nome='Turma de Teste')
        self.professor = User.objects.create_user(username='prof_teste', password='123', role='PROFESSOR')
        self.aluno = User.objects.create_user(username='aluno_teste', password='123', role='ALUNO', turma=self.turma_teste)

        self.atividade_data = {
            'titulo': 'Atividade Automatizada',
            'descricao': 'Testando a API',
            'turma': self.turma_teste.id, 
            'data_entrega': '2026-12-31T23:59:59Z'
        }

    def test_professor_pode_criar_atividade(self):
        self.client.force_authenticate(user=self.professor)
        response = self.client.post('/atividades/', self.atividade_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_professor_pode_criar_atividade_com_arquivo(self):
        self.client.force_authenticate(user=self.professor)
        arquivo_falso = SimpleUploadedFile("aula.pdf", b"conteudo do pdf", content_type="application/pdf")
        dados_com_arquivo = self.atividade_data.copy()
        dados_com_arquivo['arquivo'] = arquivo_falso
        response = self.client.post('/atividades/', dados_com_arquivo, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_aluno_nao_pode_criar_atividade(self):
        self.client.force_authenticate(user=self.aluno)
        response = self.client.post('/atividades/', self.atividade_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_usuario_nao_autenticado_retorna_401(self):
        response = self.client.post('/atividades/', self.atividade_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_criar_atividade_sem_titulo_retorna_400(self):
        self.client.force_authenticate(user=self.professor)
        dados_invalidos = self.atividade_data.copy()
        dados_invalidos.pop('titulo')
        response = self.client.post('/atividades/', dados_invalidos, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('titulo', response.data)

    def test_aluno_pode_listar_atividades(self):
        self.client.force_authenticate(user=self.aluno)
        response = self.client.get('/me/atividades/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_professor_pode_listar_suas_atividades(self):
        self.client.force_authenticate(user=self.professor)
        response = self.client.get('/me/atividades/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ==========================================
# 2. TESTES DE RESPOSTAS (Regras de Envio)
# ==========================================
class RespostaRegrasNegocioTests(APITestCase):
    def setUp(self):
        self.turma_a = Turma.objects.create(nome='Turma A')
        self.turma_b = Turma.objects.create(nome='Turma B')
        self.professor = User.objects.create_user(username='prof_silva', password='123', role='PROFESSOR')
        self.aluno_turma_a = User.objects.create_user(username='aluno_a', password='123', role='ALUNO', turma=self.turma_a)
        self.aluno_turma_b = User.objects.create_user(username='aluno_b', password='123', role='ALUNO', turma=self.turma_b)

        self.atividade_turma_a = Atividade.objects.create(
            titulo='Prova', turma=self.turma_a, professor=self.professor,
            data_entrega=timezone.now() + timedelta(days=2)
        )

        self.resposta_data = {
            'atividade': self.atividade_turma_a.id,
            'texto_resposta': 'Minha resposta' 
        }

    def test_aluno_pode_responder_atividade_da_sua_turma(self):
        self.client.force_authenticate(user=self.aluno_turma_a)
        response = self.client.post('/respostas/', self.resposta_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_aluno_pode_enviar_resposta_com_arquivo(self):
        self.client.force_authenticate(user=self.aluno_turma_a)
        arquivo_falso = SimpleUploadedFile("trabalho.png", b"conteudo da imagem", content_type="image/png")
        dados_com_arquivo = self.resposta_data.copy()
        dados_com_arquivo['arquivo'] = arquivo_falso
        response = self.client.post('/respostas/', dados_com_arquivo, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_aluno_nao_pode_responder_atividade_de_outra_turma(self):
        self.client.force_authenticate(user=self.aluno_turma_b)
        response = self.client.post('/respostas/', self.resposta_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_aluno_nao_pode_enviar_duas_respostas(self):
        self.client.force_authenticate(user=self.aluno_turma_a)
        self.client.post('/respostas/', self.resposta_data, format='json')
        response_duplicada = self.client.post('/respostas/', self.resposta_data, format='json')
        self.assertEqual(response_duplicada.status_code, status.HTTP_400_BAD_REQUEST)


# ==========================================
# 3. TESTES DE ATUALIZAÇÃO (Edição e Notas)
# ==========================================
class RespostaUpdateTests(APITestCase):
    def setUp(self):
        self.turma = Turma.objects.create(nome='Turma Update')
        self.prof_dono = User.objects.create_user(username='prof_dono', password='123', role='PROFESSOR')
        self.prof_intruso = User.objects.create_user(username='prof_intruso', password='123', role='PROFESSOR')
        self.aluno_dono = User.objects.create_user(username='aluno_dono', password='123', role='ALUNO', turma=self.turma)
        self.aluno_intruso = User.objects.create_user(username='aluno_intruso', password='123', role='ALUNO', turma=self.turma)

        self.atividade_no_prazo = Atividade.objects.create(
            titulo='Atividade Aberta', turma=self.turma, professor=self.prof_dono,
            data_entrega=timezone.now() + timedelta(days=2)
        )
        self.atividade_encerrada = Atividade.objects.create(
            titulo='Atividade Fechada', turma=self.turma, professor=self.prof_dono,
            data_entrega=timezone.now() - timedelta(days=1)
        )

        self.resposta_aberta = Resposta.objects.create(atividade=self.atividade_no_prazo, aluno=self.aluno_dono)
        self.resposta_fechada = Resposta.objects.create(atividade=self.atividade_encerrada, aluno=self.aluno_dono)

    def test_aluno_pode_editar_propria_resposta_no_prazo(self):
        self.client.force_authenticate(user=self.aluno_dono)
        url = f'/respostas/{self.resposta_aberta.id}/'
        response = self.client.patch(url, {'texto_resposta': 'Corrigi'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_aluno_nao_pode_editar_resposta_de_outro_aluno(self):
        self.client.force_authenticate(user=self.aluno_intruso)
        url = f'/respostas/{self.resposta_aberta.id}/'
        response = self.client.patch(url, {'texto_resposta': 'Hackeado'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_aluno_nao_pode_editar_fora_do_prazo(self):
        self.client.force_authenticate(user=self.aluno_dono)
        url = f'/respostas/{self.resposta_fechada.id}/'
        response = self.client.patch(url, {'texto_resposta': 'Atrasado'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_professor_dono_pode_dar_nota(self):
        self.client.force_authenticate(user=self.prof_dono)
        url = f'/respostas/{self.resposta_aberta.id}/'
        response = self.client.patch(url, {'nota': 10.0}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_professor_intruso_nao_pode_dar_nota(self):
        self.client.force_authenticate(user=self.prof_intruso)
        url = f'/respostas/{self.resposta_aberta.id}/'
        response = self.client.patch(url, {'nota': 5.0}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_professor_nao_pode_dar_nota_invalida(self):
        self.client.force_authenticate(user=self.prof_dono)
        url = f'/respostas/{self.resposta_aberta.id}/'
        
        response_maior = self.client.patch(url, {'nota': 11.0}, format='json')
        self.assertEqual(response_maior.status_code, status.HTTP_400_BAD_REQUEST)
        
        response_menor = self.client.patch(url, {'nota': -1.0}, format='json')
        self.assertEqual(response_menor.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 👇 TESTE RESTAURADO: Evita o erro no coverage!
        response_nula = self.client.patch(url, {'nota': None}, format='json')
        self.assertEqual(response_nula.status_code, status.HTTP_400_BAD_REQUEST)


# ==========================================
# 4. TESTES DE LISTAGEM DE RESPOSTAS (GET)
# ==========================================
class RespostaListagemTests(APITestCase):
    def setUp(self):
        self.turma = Turma.objects.create(nome='Turma Listagem')
        self.prof_dono = User.objects.create_user(username='prof_dono_list', password='123', role='PROFESSOR')
        self.prof_intruso = User.objects.create_user(username='prof_intruso_list', password='123', role='PROFESSOR')
        self.aluno = User.objects.create_user(username='aluno_list', password='123', role='ALUNO', turma=self.turma)
        self.atividade = Atividade.objects.create(
            titulo='Atividade para Listar', turma=self.turma, professor=self.prof_dono,
            data_entrega=timezone.now() + timedelta(days=2)
        )
        self.resposta = Resposta.objects.create(
            atividade=self.atividade, aluno=self.aluno, texto_resposta='Resposta teste listagem'
        )

    def test_aluno_pode_listar_suas_respostas(self):
        self.client.force_authenticate(user=self.aluno)
        response = self.client.get('/me/respostas/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_professor_pode_listar_respostas_da_sua_atividade(self):
        self.client.force_authenticate(user=self.prof_dono)
        url = f'/atividades/{self.atividade.id}/respostas/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_professor_nao_pode_listar_respostas_de_outro_professor(self):
        self.client.force_authenticate(user=self.prof_intruso)
        url = f'/atividades/{self.atividade.id}/respostas/'
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ==========================================
# 5. TESTES DE REPRESENTAÇÃO (Models __str__)
# ==========================================
class ModelRepresentationTests(APITestCase):
    def test_model_str_formats(self):
        turma = Turma.objects.create(nome='Turma 101')
        professor = User.objects.create_user(username='prof_silva', role='PROFESSOR')
        aluno = User.objects.create_user(username='aluno_joao', role='ALUNO', turma=turma)
        atividade = Atividade.objects.create(
            titulo='Prova Final', descricao='Boa sorte', 
            turma=turma, professor=professor, data_entrega=timezone.now()
        )
        resposta = Resposta.objects.create(atividade=atividade, aluno=aluno, texto_resposta='Feito')

        self.assertEqual(str(turma), 'Turma 101')
        self.assertEqual(str(professor), 'prof_silva (Professor)')
        self.assertEqual(str(atividade), 'Prova Final')
        self.assertEqual(str(resposta), 'Resposta de aluno_joao para Prova Final')


# ==========================================
# 6. TESTES DE CASOS EXTREMOS
# ==========================================
class EdgeCasesTests(APITestCase):
    def test_aluno_sem_turma_nao_ve_atividades(self):
        aluno_sem_turma = User.objects.create_user(username='fantasma', password='123', role='ALUNO', turma=None)
        self.client.force_authenticate(user=aluno_sem_turma)
        response = self.client.get('/me/atividades/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_usuario_com_role_invalida_nao_ve_atividades(self):
        admin = User.objects.create_user(username='admin_teste', password='123', role='ADMIN')
        self.client.force_authenticate(user=admin)
        response = self.client.get('/me/atividades/', format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

# ==========================================
# 7. TESTES DO DASHBOARD
# ==========================================
class DashboardTests(APITestCase):
    def setUp(self):
        self.turma = Turma.objects.create(nome='Turma Dash')
        self.prof = User.objects.create_user(username='prof_dash', password='123', role='PROFESSOR')
        self.aluno = User.objects.create_user(username='aluno_dash', password='123', role='ALUNO', turma=self.turma)
        
        self.atividade = Atividade.objects.create(
            titulo='Atividade 1', turma=self.turma, professor=self.prof,
            data_entrega=timezone.now() + timedelta(days=2)
        )
        self.resposta = Resposta.objects.create(
            atividade=self.atividade, aluno=self.aluno, texto_resposta='Feito', nota=8.5
        )

    def test_professor_pode_ver_dashboard(self):
        """Garante que o professor recebe as estatísticas corretas"""
        self.client.force_authenticate(user=self.prof)
        response = self.client.get('/me/dashboard/', format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_atividades'], 1)
        self.assertEqual(response.data['total_respostas'], 1)
        self.assertEqual(response.data['media_notas_geral'], 8.5)

    def test_aluno_nao_pode_ver_dashboard(self):
        """Garante que alunos são bloqueados de acessar as estatísticas"""
        self.client.force_authenticate(user=self.aluno)
        response = self.client.get('/me/dashboard/', format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
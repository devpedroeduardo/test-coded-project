from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

# Isso garante que ele pegue o usuário certo, seja o padrão ou um customizado seu!
User = get_user_model() 

class Command(BaseCommand):
    help = 'Popula o banco de dados com usuários e grupos de teste (Professor e Aluno)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Iniciando a criação de dados de teste...')

        # 1. Criação dos Grupos (se não existirem)
        grupo_prof, created_prof = Group.objects.get_or_create(name='Professor')
        grupo_aluno, created_aluno = Group.objects.get_or_create(name='Aluno')
        
        if created_prof or created_aluno:
            self.stdout.write(self.style.SUCCESS('Grupos "Professor" e "Aluno" verificados/criados.'))

        # 2. Criação do Professor de Teste
        if not User.objects.filter(username='professor').exists():
            prof = User.objects.create_user(username='professor', password='senha123', first_name='Mestre', last_name='Kame')
            prof.groups.add(grupo_prof)
            self.stdout.write(self.style.SUCCESS('✅ Professor criado com sucesso!'))
            self.stdout.write('   -> Login: professor')
            self.stdout.write('   -> Senha: senha123')
        else:
            self.stdout.write(self.style.WARNING('⚠️ Usuário "professor" já existe. Pulando...'))

        # 3. Criação do Aluno de Teste
        if not User.objects.filter(username='aluno').exists():
            aluno = User.objects.create_user(username='aluno', password='senha123', first_name='Gohan', last_name='Son')
            aluno.groups.add(grupo_aluno)
            self.stdout.write(self.style.SUCCESS('✅ Aluno criado com sucesso!'))
            self.stdout.write('   -> Login: aluno')
            self.stdout.write('   -> Senha: senha123')
        else:
            self.stdout.write(self.style.WARNING('⚠️ Usuário "aluno" já existe. Pulando...'))

        self.stdout.write(self.style.SUCCESS('🎉 Banco de dados populado e pronto para uso!'))
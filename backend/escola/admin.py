from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Turma, Atividade, Resposta

# Criamos uma configuração customizada para o painel de Usuários
class CustomUserAdmin(UserAdmin):
    # Adicionamos uma nova seção com os nossos campos personalizados
    fieldsets = UserAdmin.fieldsets + (
        ('Informações da Escola', {'fields': ('role', 'turma')}),
    )

# Registramos usando a nossa configuração customizada
admin.site.register(User, CustomUserAdmin)
admin.site.register(Turma)
admin.site.register(Atividade)
admin.site.register(Resposta)
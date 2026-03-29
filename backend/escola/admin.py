from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Turma, Atividade, Resposta

# Configuração customizada para o painel de Usuários
class CustomUserAdmin(UserAdmin):
    # Nova sessão com os nossos campos personalizados
    fieldsets = UserAdmin.fieldsets + (
        ('Informações da Escola', {'fields': ('role', 'turma')}),
    )

# Registro daconfiguração customizada
admin.site.register(User, CustomUserAdmin)
admin.site.register(Turma)
admin.site.register(Atividade)
admin.site.register(Resposta)
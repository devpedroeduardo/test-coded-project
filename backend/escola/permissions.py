from rest_framework import permissions

class IsProfessor(permissions.BasePermission):
    """Permite acesso apenas a usuários com role PROFESSOR."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PROFESSOR')

class IsAluno(permissions.BasePermission):
    """Permite acesso apenas a usuários com role ALUNO."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ALUNO')
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from escola.views import (
    MeAtividadesView, AtividadeCreateView, 
    RespostaCreateView, MeRespostasView, 
    AtividadeRespostasView, RespostaUpdateView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    
    # Endpoints de Atividades
    path('me/atividades/', MeAtividadesView.as_view(), name='me-atividades'),
    path('atividades/', AtividadeCreateView.as_view(), name='criar-atividade'),
    
    # Endpoints de Respostas
    path('respostas/', RespostaCreateView.as_view(), name='enviar-resposta'),
    path('me/respostas/', MeRespostasView.as_view(), name='me-respostas'),
    path('atividades/<int:id>/respostas/', AtividadeRespostasView.as_view(), name='atividade-respostas'),
    path('respostas/<int:id>/', RespostaUpdateView.as_view(), name='editar-resposta'),
]
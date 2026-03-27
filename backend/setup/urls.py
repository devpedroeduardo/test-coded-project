from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView
from escola.views import (
    MeAtividadesView, AtividadeCreateView, 
    RespostaCreateView, MeRespostasView, 
    AtividadeRespostasView, RespostaUpdateView,
    ProfessorDashboardView # <-- Dashboard importado aqui
)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Endpoints de Atividades
    path('me/atividades/', MeAtividadesView.as_view(), name='me-atividades'),
    path('atividades/', AtividadeCreateView.as_view(), name='criar-atividade'),
    
    # Endpoints de Respostas
    path('respostas/', RespostaCreateView.as_view(), name='enviar-resposta'),
    path('me/respostas/', MeRespostasView.as_view(), name='me-respostas'),
    path('atividades/<int:id>/respostas/', AtividadeRespostasView.as_view(), name='atividade-respostas'),
    path('respostas/<int:id>/', RespostaUpdateView.as_view(), name='editar-resposta'),
    
    # Endpoints de Dashboard
    path('me/dashboard/', ProfessorDashboardView.as_view(), name='me-dashboard'), # <-- Dashboard adicionado aqui
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
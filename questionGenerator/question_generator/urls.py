from django.urls import path
from .views import GenerateITModelPaperAPIView,SaveUserResponseAPIView,RetrieveUserResponseAPIView

urlpatterns = [
    path('generate-ITmodel-paper', GenerateITModelPaperAPIView.as_view(), name='generate-it-model-paper'),
    path('save-response', SaveUserResponseAPIView.as_view(), name='save-response'),
    path('get-response', RetrieveUserResponseAPIView.as_view(), name='get-response'),
]

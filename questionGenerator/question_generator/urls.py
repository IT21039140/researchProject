# question_generator/urls.py
from django.urls import path
from .views import GenerateModelPaperAPIView

urlpatterns = [
    path('generate-model-paper/', GenerateModelPaperAPIView.as_view(), name='generate-model-paper')
]

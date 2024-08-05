from django.urls import path
from .views import gateway_view

urlpatterns = [
    path('<str:service>/<path:endpoint>/', gateway_view),
]

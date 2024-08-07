from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('refresh/', views.refresh_token),
    path('users/', views.user_list),
    path('users/<str:email>/', views.user_detail),
    path('<str:service>/<path:endpoint>/', views.gateway_view),
]

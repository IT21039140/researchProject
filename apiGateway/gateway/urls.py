#gateway/url.py
from django.urls import path
from . import views
from .views import StripeWebhookView

urlpatterns = [
    path('register/', views.register),
    path('login/', views.login),
    path('refresh/', views.refresh_token),
    path('users/', views.user_list),
    path('users/<str:email>/', views.user_detail),
    path('<str:service>/<path:endpoint>/', views.gateway_view),

    path('subscription/create/', views.create_subscription),  # POST request
    path('subscription/cancel/', views.cancel_subscription),  # PUT request
    path('subscription/retrieve/<str:email>/', views.retrieve_subscription),
    # GET request

    # Payment-related endpoints
    path('payment/history/<str:email>/', views.retrieve_payment_history),
    # GET request

    path('add-plan/', views.add_subscription_plan),

    path('stripe/webhook/', StripeWebhookView.as_view())
]

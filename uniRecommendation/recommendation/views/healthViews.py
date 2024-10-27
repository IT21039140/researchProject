# In your Django application views.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy'})
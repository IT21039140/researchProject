from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from requests.exceptions import RequestException
from django.conf import settings
from django.http import JsonResponse

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def gateway_view(request, service, endpoint):
    if service not in settings.SERVICE_URLS:
        return JsonResponse({"error": "Service not found"}, status=404)
    
    url = f'{settings.SERVICE_URLS[service]}{endpoint}'
    method = request.method
    
    try:
        if method == 'GET':
            response = requests.get(url, params=request.query_params)
        elif method == 'POST':
            response = requests.post(url, json=request.data)
        elif method == 'PUT':
            response = requests.put(url, json=request.data)
        elif method == 'DELETE':
            response = requests.delete(url)
        
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx and 5xx)
        return Response(response.json(), status=response.status_code)
    
    except RequestException as e:
        return JsonResponse({"error": str(e)}, status=500)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

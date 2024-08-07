from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from requests.exceptions import RequestException
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from .models import UserEdu
from .serializers import UserSerializer, LoginSerializer
from .authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
import jwt

@api_view(['POST'])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception:
            return Response({"detail": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = UserEdu.objects.get(email=serializer.validated_data['email'])
            if user.check_password(serializer.validated_data['password']):
                access_token = JWTAuthentication.generate_access_token(user)
                refresh_token = JWTAuthentication.generate_refresh_token(user)
                return Response({
                    'access': access_token,
                    'refresh': refresh_token
                }, status=status.HTTP_200_OK)
            else:
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except UserEdu.DoesNotExist:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def refresh_token(request):
    token = request.data.get('refresh')
    if not token:
        return Response({"detail": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user = UserEdu.objects.get(id=payload['user_id'])
        access_token = JWTAuthentication.generate_access_token(user)
        return Response({'access': access_token}, status=status.HTTP_200_OK)
    except jwt.ExpiredSignatureError:
        return Response({"detail": "Refresh token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
    except UserEdu.DoesNotExist:
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    users = UserEdu.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail(request, email):
    try:
        user = UserEdu.objects.get(email=email)
    except UserEdu.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
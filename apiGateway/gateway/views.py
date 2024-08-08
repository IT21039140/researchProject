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
import logging

log = logging.getLogger('gateway')

@api_view(['POST'])
def register(request):
    log.info(f'Started register in gateWay view')
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        try:
            serializer.save()
            log.info('End register in gateWay view: Successful')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            log.error(f'End register in gateWay view: {e}')
            return Response({"detail": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)
    log.error('End register in gateWay view: Invalid registration data')
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    log.info('Started login in gateWay view')
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = UserEdu.objects.get(email=serializer.validated_data['email'])
            if user.check_password(serializer.validated_data['password']):
                access_token = JWTAuthentication.generate_access_token(user)
                refresh_token = JWTAuthentication.generate_refresh_token(user)
                log.info('End login in gateWay view: Successful')
                return Response({
                    'access': access_token,
                    'refresh': refresh_token
                }, status=status.HTTP_200_OK)
            else:
                log.info('End login in gateWay view: Fail: Invalid credentials')
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except UserEdu.DoesNotExist as e:
            log.error(f'End login in gateWay view: Fail: Exception {e}')
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    log.error('End login in gateWay view: Invalid login data')
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def refresh_token(request):
    token = request.data.get('refresh')
    if not token:
        log.error('End refresh_token in gateWay view: Refresh token required')
        return Response({"detail": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user = UserEdu.objects.get(id=payload['user_id'])
        access_token = JWTAuthentication.generate_access_token(user)
        log.info('End refresh_token in gateWay view: Successful')
        return Response({'access': access_token}, status=status.HTTP_200_OK)
    except jwt.ExpiredSignatureError:
        log.error('End refresh_token in gateWay view: Refresh token has expired')
        return Response({"detail": "Refresh token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        log.error('End refresh_token in gateWay view: Invalid refresh token')
        return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
    except UserEdu.DoesNotExist:
        log.error('End refresh_token in gateWay view: User not found')
        return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gateway_view(request, service, endpoint):
    service_url = settings.SERVICE_URLS.get(service.lower())

    if not service_url:
        log.error(f'Service not found: {service}')
        return JsonResponse({"error": "Service not found"}, status=404)

    url = f'{service_url}{endpoint}'
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
        log.info(f'gateway_view success for service: {service}, endpoint: {endpoint}')
        return Response(response.json(), status=response.status_code)
    
    except RequestException as e:
        log.error(f'gateway_view RequestException for service: {service}, endpoint: {endpoint}, error: {e}')
        return JsonResponse({"error": str(e)}, status=500)
    except Exception as e:
        log.error(f'gateway_view Exception for service: {service}, endpoint: {endpoint}, error: {e}')
        return JsonResponse({"error": str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list(request):
    log.info('user_list called')
    users = UserEdu.objects.all()
    serializer = UserSerializer(users, many=True)
    log.info('user_list successful')
    return Response(serializer.data)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def user_detail(request, email):
    log.info(f'user_detail called for email: {email}')
    try:
        user = UserEdu.objects.get(email=email)
    except UserEdu.DoesNotExist:
        log.error(f'user_detail User not found for email: {email}')
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        log.info(f'user_detail GET successful for email: {email}')
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            log.info(f'user_detail PUT successful for email: {email}')
            return Response(serializer.data)
        log.error(f'user_detail PUT failed for email: {email}, errors: {serializer.errors}')
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        log.info(f'user_detail DELETE successful for email: {email}')
        return Response(status=status.HTTP_204_NO_CONTENT)

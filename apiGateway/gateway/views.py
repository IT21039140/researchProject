#gateway/views.py
import datetime
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
from requests.exceptions import RequestException
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status
from stripe import StripeErrorWithParamCode
from django.views import View
from .models import UserEdu, SubscriptionDetails, PaymentHistory, SubscriptionPlan
from .serializers import UserSerializer, LoginSerializer, PasswordResetRequestSerializer, PasswordResetSerializer
from .authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
# from rest_framework.permissions import AllowAny
import jwt
import logging
# import stripe
import stripe

log = logging.getLogger('gateway')
# Set Stripe secret key
stripe.api_key = settings.STRIPE_SECRET_KEY

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

# Utility function to generate reset token
def generate_password_reset_token(email):
    expiration = timezone.now() + datetime.timedelta(hours=1)  # Token valid for 1 hour
    payload = {
        'email': email,
        'exp': expiration,
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


@api_view(['POST'])
def request_password_reset(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = UserEdu.objects.get(email=email)
            reset_token = generate_password_reset_token(user.email)

            # Send the reset token to the user's email
            subject = "Password Reset Request"
            message = f"Hello {user.first_name},\n\nYou requested a password reset. Please use the following token to reset your password:\n\n{reset_token}\n\nIf you did not request this, please ignore this email."
            recipient_list = [user.email]

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                fail_silently=False,
            )

            log.info(f"Password reset email sent for email: {email}")
            return Response({"message": "Password reset token sent to email."}, status=status.HTTP_200_OK)

        except UserEdu.DoesNotExist:
            log.error(f"Password reset requested for non-existent email: {email}")
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

    log.error("Invalid data in request_password_reset")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def reset_password(request):
    serializer = PasswordResetSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']

        try:
            # Decode the token to get the email
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            email = payload.get('email')

            # Retrieve the user
            user = UserEdu.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            log.info(f"Password reset successful for email: {email}")

            return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            log.error("Expired password reset token")
            return Response({"error": "Reset token has expired"}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.InvalidTokenError:
            log.error("Invalid password reset token")
            return Response({"error": "Invalid reset token"}, status=status.HTTP_400_BAD_REQUEST)
        except UserEdu.DoesNotExist:
            log.error(f"Password reset attempted for non-existent email in token")
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)

    log.error("Invalid data in reset_password")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def gateway_view(request, service, endpoint):
    log.info(f'Service : {service} : End point: {endpoint}')
    service_url = settings.SERVICE_URLS.get(service.lower())

    log.info(f'Service service_url: {service_url}')


    if not service_url:
        log.error(f'Service not found: {service}')
        return JsonResponse({"error": "Service not found"}, status=404)

    url = f'{service_url}{endpoint}'
    log.info(f'Service service_url full: {url}')
    method = request.method

    access_token = request.headers.get('Authorization')
    
    if access_token:
        headers = {'Authorization': access_token}
    else:
        log.error('Authorization token is missing')
        return JsonResponse({"error": "Authorization token is missing"}, status=401)

    log.info(f'Accessing URL: {url} with method: {method} and headers: {headers}')

    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, params=request.query_params)
        elif method == 'POST':
            response = requests.post(url, headers=headers, json=request.data)
        elif method == 'PUT':
            response = requests.put(url, headers=headers, json=request.data)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers,json=request.data)
        
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    log.info("Started create_subscription")
    email = request.data.get('email')
    stripe_token = request.data.get('stripe_token')

    if not email or not stripe_token:
        return Response({"error": "Email and Stripe token are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve the user
    try:
        user = UserEdu.objects.get(email=email)
    except UserEdu.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Retrieve the subscription plan (assuming only one plan exists)
    try:
        plan = SubscriptionPlan.objects.first()
    except SubscriptionPlan.DoesNotExist:
        return Response({"error": "Subscription plan not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        # Create a new Stripe customer if not already created
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=email,
                source=stripe_token
            )
            user.stripe_customer_id = customer['id']
            user.save()

        # Check if a subscription already exists for the user
        subscription = SubscriptionDetails.objects(email=email).first()

        if subscription:
            # Update existing subscription details
            subscription.plan_id = plan.plan_id
            subscription.start_date = datetime.datetime.utcnow()
            subscription.subscription_status = "active"
        else:
            # Create a new subscription record if one does not exist
            subscription = SubscriptionDetails(
                email=email,
                plan_id=plan.plan_id,
                start_date=datetime.datetime.utcnow(),
                subscription_status="active"
            )

        # Create a subscription for the customer on Stripe
        stripe_subscription = stripe.Subscription.create(
            customer=user.stripe_customer_id,
            items=[{'plan': plan.plan_id}],
            expand=["latest_invoice.payment_intent"],
        )

        # Save the Stripe subscription ID and status
        subscription.stripe_subscription_id = stripe_subscription['id']
        subscription.subscription_status = stripe_subscription['status']
        subscription.save()

        # Mark the user as subscribed
        user.is_subscribed = True
        user.save()

        return Response({"message": "Subscription created successfully."}, status=status.HTTP_201_CREATED)

    except StripeErrorWithParamCode as e:
        log.error(f"Stripe error: {str(e)}")
        return Response({"error": "An error occurred with the payment gateway."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    email = request.data.get('email')

    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Retrieve the user's subscription
    try:
        subscription = SubscriptionDetails.objects.get(email=email)
    except SubscriptionDetails.DoesNotExist:
        return Response({"error": "Subscription not found."}, status=status.HTTP_404_NOT_FOUND)

    try:
        # Cancel the subscription on Stripe
        stripe.Subscription.delete(subscription.stripe_subscription_id)

        # Update subscription status in the database
        subscription.subscription_status = "canceled"
        subscription.end_date = datetime.datetime.utcnow()
        subscription.save()

        # Update user subscription status
        try:
            user = UserEdu.objects.get(email=email)
            user.is_subscribed = False
            user.save()
        except UserEdu.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"message": "Subscription canceled successfully."}, status=status.HTTP_200_OK)

    except StripeErrorWithParamCode as e:
        log.error(f"Stripe error: {str(e)}")
        return Response({"error": "An error occurred with the payment gateway."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retrieve_subscription(request, email):
    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Retrieve the subscription details for the user
        subscription = SubscriptionDetails.objects.get(email=email)
        subscription_data = {
            "email": subscription.email,
            "stripe_subscription_id": subscription.stripe_subscription_id,
            "subscription_status": subscription.subscription_status,
            "plan_id": subscription.plan_id,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date
        }
        return Response(subscription_data, status=status.HTTP_200_OK)
    except SubscriptionDetails.DoesNotExist:
        return Response({"error": "Subscription not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def retrieve_payment_history(request, email):
    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Retrieve the payment history for the user
        payments = PaymentHistory.objects(email=email)

        if not payments:
            return Response({"error": "No payment history found for this user."}, status=status.HTTP_404_NOT_FOUND)

        payment_history = [{
            "payment_id": payment.payment_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "payment_date": payment.payment_date,
            "payment_status": payment.payment_status
        } for payment in payments]

        return Response({"payment_history": payment_history}, status=status.HTTP_200_OK)
    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def add_subscription_plan(request):
    try:
        # Extract data from the request payload
        name = request.data.get('name')
        price = request.data.get('price')
        currency = request.data.get('currency', 'usd')
        interval = request.data.get('interval', 'month')
        description = request.data.get('description', '')

        if not name or not price:
            return Response({"error": "Name and price are required fields."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the plan on Stripe
        try:
            stripe_plan = stripe.Plan.create(
                amount=int(float(price) * 100),  # Stripe requires the amount in cents
                currency=currency,
                interval=interval,
                product={"name": name},
            )
        except stripe.error.StripeError as e:
            log.error(f"Stripe error: {str(e)}")
            return Response({"error": "Failed to create the plan on Stripe."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save the subscription plan in the database
        plan = SubscriptionPlan(
            plan_id=stripe_plan['id'],
            name=name,
            price=price,
            currency=currency,
            interval=interval,
            description=description
        )
        plan.save()

        return Response({"message": "Subscription plan created successfully."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        log.error(f"Unexpected error: {str(e)}")
        return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(View):
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            log.error(f"Invalid payload: {str(e)}")
            return JsonResponse({"error": "Invalid payload"}, status=400)
        except stripe.error.SignatureVerificationError as e:
            log.error(f"Invalid signature: {str(e)}")
            return JsonResponse({"error": "Invalid signature"}, status=400)

        if event['type'] == 'invoice.payment_succeeded':
            payment_intent = event['data']['object']
            log.info(f"Payment succeeded: {payment_intent['id']}")
            self.handle_payment_success(payment_intent)

        elif event['type'] == 'invoice.payment_failed':
            payment_intent = event['data']['object']
            log.error(f"Payment failed: {payment_intent['id']}")
            self.handle_payment_failure(payment_intent)

        return JsonResponse({'status': 'success'})

    def handle_payment_success(self, payment_intent):
        stripe_subscription_id = payment_intent['subscription']
        email = payment_intent['customer_email']

        subscription = stripe.Subscription.objects(email=email, stripe_subscription_id=stripe_subscription_id).first()

        if subscription:
            subscription.subscription_status = "active"
            subscription.save()

            PaymentHistory(
                email=email,
                amount=payment_intent['amount_paid'],
                currency=payment_intent['currency'],
                payment_status='succeeded',
                payment_id=payment_intent['id'],
                payment_date=datetime.datetime.now()
            ).save()

            log.info(f"Subscription activated for {email}")
        else:
            log.error(f"Subscription not found for {email}")

    def handle_payment_failure(self, payment_intent):
        stripe_subscription_id = payment_intent['subscription']
        email = payment_intent['customer_email']

        subscription = stripe.Subscription.objects(email=email, stripe_subscription_id=stripe_subscription_id).first()

        if subscription:
            subscription.subscription_status = "failed"
            subscription.save()

            PaymentHistory(
                email=email,
                amount=payment_intent['amount_paid'],
                currency=payment_intent['currency'],
                payment_status='failed',
                payment_id=payment_intent['id'],
                payment_date=datetime.datetime.now()
            ).save()

            log.error(f"Payment failed for {email}")
        else:
            log.error(f"Subscription not found for {email}")




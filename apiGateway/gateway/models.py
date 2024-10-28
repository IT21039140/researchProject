from mongoengine import Document, EmailField, StringField, DecimalField, DateTimeField, BooleanField
from django.contrib.auth.hashers import make_password, check_password
from django.utils.functional import cached_property
import datetime

class UserEdu(Document):
    email = EmailField(required=True, unique=True)
    first_name = StringField(max_length=30)
    last_name = StringField(max_length=30)
    password = StringField(max_length=128, required=True)
    # Stripe customer ID for subscription management
    stripe_customer_id = StringField(max_length=100, null=True)  # Add this field

    # Subscription status for the user
    is_subscribed = BooleanField(default=False)  # True if the user has an active subscription

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    @cached_property
    def is_authenticated(self):
        # Always return True for a valid user
        return True

    def __str__(self):
        return self.email


class SubscriptionDetails(Document):
    """Details of the subscription for a user."""
    email = EmailField(required=True, unique=True)  # Link to the user via email
    stripe_subscription_id = StringField(max_length=100, unique=True)  # Stripe subscription ID
    subscription_status = StringField(max_length=30, choices=["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"], default="incomplete")
    plan_id = StringField(max_length=100, required=True)  # Stripe Plan ID
    start_date = DateTimeField(default=datetime.datetime.utcnow)
    end_date = DateTimeField()  # Optional end date for canceled subscriptions

    def __str__(self):
        return f"{self.email} - {self.subscription_status}"


class PaymentHistory(Document):
    """Track individual payment history for the subscription."""
    email = EmailField(required=True)  # Link to the user via email
    payment_id = StringField(max_length=100, unique=True)  # Stripe payment ID
    amount = DecimalField(min_value=0, precision=2)  # Payment amount
    currency = StringField(max_length=10, default="usd")  # Currency of the payment
    payment_date = DateTimeField(default=datetime.datetime.utcnow)  # When the payment occurred
    payment_status = StringField(max_length=30, choices=["succeeded", "pending", "failed"], default="pending")

    def __str__(self):
        return f"{self.email} - {self.payment_id} - {self.payment_status}"


class SubscriptionPlan(Document):
    """Store information about the single subscription plan."""
    plan_id = StringField(max_length=100, required=True)  # Stripe Plan ID
    name = StringField(max_length=100, required=True)  # Plan name
    price = DecimalField(min_value=0, precision=2, required=True)  # Price of the plan
    currency = StringField(max_length=10, default="usd")  # Currency for the plan
    interval = StringField(max_length=30, choices=["day", "week", "month", "year"], default="month")  # Billing interval
    description = StringField(max_length=255)  # Description of the plan

    def __str__(self):
        return f"{self.name} - {self.price} {self.currency}/{self.interval}"
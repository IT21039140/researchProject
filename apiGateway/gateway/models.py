from mongoengine import Document, EmailField, StringField
from django.contrib.auth.hashers import make_password, check_password
from django.utils.functional import cached_property

class UserEdu(Document):
    email = EmailField(required=True, unique=True)
    first_name = StringField(max_length=30)
    last_name = StringField(max_length=30)
    password = StringField(max_length=128, required=True)

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

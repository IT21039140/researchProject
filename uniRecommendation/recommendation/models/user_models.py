from mongoengine import Document, EmbeddedDocument, fields
from datetime import datetime
import pytz

# Define Sri Lanka timezone
SL_TZ = pytz.timezone('Asia/Colombo')

class Result(EmbeddedDocument):
    subject = fields.StringField(max_length=100)
    grade = fields.StringField(max_length=2)

class User(Document):
    Name = fields.StringField(max_length=100)
    Year = fields.IntField()
    Stream = fields.StringField(max_length=100)
    Results = fields.ListField(fields.EmbeddedDocumentField(Result))
    English = fields.StringField(max_length=2)
    Preferred_University = fields.StringField(max_length=50)
    Locations = fields.ListField(fields.StringField())  # List of locations
    areas = fields.ListField(fields.StringField())  # List of areas
    Career_Areas = fields.ListField(fields.StringField())  # List of career areas
    duration = fields.StringField(max_length=50)
    user_id = fields.StringField(max_length=50)
    created_at = fields.DateTimeField()
    updated_at = fields.DateTimeField()

    meta = {'collection': 'NPreferences'}

    def save(self, *args, **kwargs):
        # If this is a new document, set `created_at`
        if not self.pk:
            self.created_at = datetime.now(SL_TZ)
        # Always update `updated_at` on every save
        self.updated_at = datetime.now(SL_TZ)
        return super(User, self).save(*args, **kwargs)

    def __str__(self):
        return self.Name

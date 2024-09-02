from mongoengine import Document, EmbeddedDocument,fields

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

    meta = {'collection': 'NPreferences'}

    def __str__(self):
        return self.name



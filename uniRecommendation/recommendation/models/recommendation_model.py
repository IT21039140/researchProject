from mongoengine import Document, EmbeddedDocument , EmbeddedDocumentListField, fields

class UserRecommendations(EmbeddedDocument):
    course_code = fields.StringField(default="N/A")
    course_name = fields.StringField(default="N/A")
    university = fields.StringField(default="N/A")
    specialization = fields.StringField(default="None")
    duration = fields.StringField(default="N/A")
class Recommendation(Document):
    user_id = fields.StringField(required=True)
    meta = {'collection': 'RecommendationsHistory'}
    recommendations = EmbeddedDocumentListField(UserRecommendations)




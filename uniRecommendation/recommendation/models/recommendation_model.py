from mongoengine import Document, EmbeddedDocument , EmbeddedDocumentListField, fields

class UserRecommendations(EmbeddedDocument):
    course_code = fields.StringField(default="N/A")
    course_name = fields.StringField(default="N/A")
    university = fields.StringField(default="N/A")
    specialization = fields.StringField(default="None")
    duration = fields.StringField(default="N/A")
    Stream_Score = fields.FloatField(default=0)
    Area_Score = fields.FloatField(default= 0)
    Location_Score = fields.FloatField(default=0)
    Career_Score = fields.FloatField(default=0)
    Duration_Score = fields.FloatField(default=0)
    Score = fields.FloatField(default=0)

    

class Recommendation(Document):
    user_id = fields.StringField(required=True)
    meta = {'collection': 'RecommendationsHistory'}
    recommendations = EmbeddedDocumentListField(UserRecommendations)





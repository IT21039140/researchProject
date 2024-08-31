from mongoengine import Document, fields

class recommendation(Document):
    user_id = fields.ObjectIdField()
    course_code = fields.StringField(default="N/A")
    course_name = fields.StringField(default="N/A")
    university = fields.StringField(default="N/A")
    specialization = fields.StringField(default="None")
    duration = fields.StringField(default="N/A")
    user_id = fields.StringField(required=True)
    meta = {'collection': 'Government_Recommendations'}
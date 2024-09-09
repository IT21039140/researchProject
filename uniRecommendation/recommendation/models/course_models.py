# models.py

from mongoengine import Document, EmbeddedDocument, EmbeddedDocumentListField, fields

class MinimumEligibilityRequirement(EmbeddedDocument):
    subjects = fields.ListField(fields.StringField())
    grade = fields.StringField(max_length=2)
  

class University(EmbeddedDocument):
    uni_name = fields.StringField(max_length=200)
    specializations = fields.ListField(fields.StringField())
    province = fields.StringField(max_length=100)
    location = fields.StringField(max_length=100)
    duration = fields.StringField(max_length=50)
    degree_offered = fields.StringField(max_length=100)
    medium = fields.StringField(max_length=100)
    
class Course(Document):
    stream = fields.StringField(max_length=100)
    course_name = fields.StringField(max_length=200)
    course_code = fields.StringField(max_length=20)
    proposed_intake = fields.IntField()
    minimum_eligibility_requirements = EmbeddedDocumentListField(MinimumEligibilityRequirement)
    universities = EmbeddedDocumentListField(University)
    area = fields.StringField(max_length=100)
    english_requirement = fields.StringField(max_length=20)
    math_requirement = fields.StringField(max_length=20)    
    science_requirement = fields.StringField(max_length=20)
    meta = {'collection': 'Government_Courses'}  # Collection name for courses
    important_note=fields.StringField(max_length=200)
    guidance_and_information = fields.StringField(max_length=200)
    additional_requirements = fields.ListField(fields.StringField())


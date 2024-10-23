# # question_generator/models.py
from djongo import models
from datetime import datetime

class GeneratedITQuestions(models.Model):
    question_number = models.IntegerField()
    question_text = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=100)
    paperId = models.IntegerField()
    generated_datetime = models.DateTimeField(default=datetime.now)

    class Meta:
        db_table = 'generated_IT_questions'

    def __str__(self):
        return self.question_text

class UserPaper(models.Model):
    user_id = models.CharField(max_length=100)
    paperId = models.IntegerField(unique=True)
    paperDes = models.TextField()
    number_of_questions = models.IntegerField()

    class Meta:
        db_table = 'user_paper'
        indexes = [
            models.Index(fields=['paperId'])  # Adding index for performance
        ]

    def __str__(self):
        return f"Paper ID: {self.paperId} - Description: {self.paperDes}"

class QuestionResponse(models.Model):
    question_number = models.IntegerField()
    question = models.TextField()
    options = models.JSONField()
    answered_correct = models.BooleanField()
    user_answer = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=255)

    class Meta:
        abstract = True  # Makes it embeddable in UserResponse

class UserResponse(models.Model):
    email = models.EmailField()
    paperId = models.IntegerField()
    paperDes = models.TextField()  # New field added
    number_of_questions = models.IntegerField()
    user_score = models.IntegerField()
    questions = models.ArrayField(model_container=QuestionResponse)  # Embedding question responses

    class Meta:
        db_table = 'user_responses'

    def __str__(self):
        return f"{self.email} - Paper ID: {self.paperId}"

# from djongo import models
# from datetime import datetime
#
# class GeneratedITQuestions(models.Model):
#     question_number = models.IntegerField()
#     question_text = models.TextField()
#     options = models.JSONField()
#     correct_answer = models.CharField(max_length=100)
#     paperId = models.IntegerField()
#     generated_datetime = models.DateTimeField(default=datetime.now)
#
#
#     class Meta:
#         db_table = 'generated_IT_questions'
#
#     def __str__(self):
#         return self.question_text
#
# class UserPaper(models.Model):
#     user_id = models.CharField(max_length=100)
#     paperId = models.IntegerField(unique=True)
#     paperDes = models.TextField()
#     number_of_questions = models.IntegerField()
#
#     class Meta:
#         db_table = 'user_paper'
#
#     def __str__(self):
#         return f"Paper ID: {self.paperId} - Description: {self.paperDes}"
#
# class UserResponse(models.Model):
#     email = models.EmailField()
#     paperId = models.IntegerField()
#     number_of_questions = models.IntegerField()
#     user_score = models.IntegerField()
#
#     class Meta:
#         db_table = 'user_responses'
#
#     def __str__(self):
#         return f"{self.email} - Paper ID: {self.paperId}"
#
# class QuestionResponse(models.Model):
#     user_response = models.ForeignKey(UserResponse, related_name='questions', on_delete=models.CASCADE)
#     question_number = models.IntegerField()
#     question = models.TextField()
#     options = models.JSONField()
#     answered_correct = models.BooleanField()
#     user_answer = models.CharField(max_length=255)
#     correct_answer = models.CharField(max_length=255)
#
#     class Meta:
#         db_table = 'question_responses'
#
#     def __str__(self):
#         return f"Question {self.question_number} for Paper ID: {self.user_response.paperId}"

# from mongoengine import Document, StringField, IntField, EmailField, ListField, BooleanField, DateTimeField, ReferenceField
# from datetime import datetime
#
# class GeneratedITQuestions(Document):
#     question_number = IntField(required=True)
#     question_text = StringField(required=True)
#     options = ListField(StringField(), required=True)
#     correct_answer = StringField(max_length=100, required=True)
#     paperId = IntField(required=True)
#     generated_datetime = DateTimeField(default=datetime.now)
#
#     meta = {'collection': 'generated_IT_questions'}
#
#     def __str__(self):
#         return self.question_text
#
#
# class UserPaper(Document):
#     user_id = StringField(max_length=100, required=True)
#     paperId = IntField(unique=True, required=True)
#     paperDes = StringField(required=True)
#     number_of_questions = IntField(required=True)
#
#     meta = {'collection': 'user_paper'}
#
#     def __str__(self):
#         return f"Paper ID: {self.paperId} - Description: {self.paperDes}"
#
#
# class UserResponse(Document):
#     email = EmailField(required=True)
#     paperId = IntField(required=True)
#     number_of_questions = IntField(required=True)
#     user_score = IntField(required=True)
#
#     meta = {'collection': 'user_responses'}
#
#     def __str__(self):
#         return f"{self.email} - Paper ID: {self.paperId}"
#
#
# class QuestionResponse(Document):
#     user_response = ReferenceField(UserResponse, reverse_delete_rule=2)  # CASCADE deletion on UserResponse
#     question_number = IntField(required=True)
#     question = StringField(required=True)
#     options = ListField(StringField(), required=True)
#     answered_correct = BooleanField(required=True)
#     user_answer = StringField(max_length=255, required=True)
#     correct_answer = StringField(max_length=255, required=True)
#
#     meta = {'collection': 'question_responses'}
#
#     def __str__(self):
#         return f"Question {self.question_number} for Paper ID: {self.user_response.paperId}"
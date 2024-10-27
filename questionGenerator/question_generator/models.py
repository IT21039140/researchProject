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


class QuestionContent(models.Model):
    title = models.TextField()
    questions = models.TextField()
    question_set_no = models.IntegerField()  # Used to track each question set's number

    class Meta:
        abstract = True  # Indicates this is an embedded model


class GeneratedLawQuestions(models.Model):
    email = models.EmailField()  # User's email
    paperId = models.IntegerField(unique=True)  # Unique paper ID for each generated set of questions
    generated_datetime = models.DateTimeField(default=datetime.now)  # Date when the questions were generated
    questions = models.ArrayField(model_container=QuestionContent)  # Stores each question set as an array of QuestionContent

    class Meta:
        db_table = 'generated_law_questions'

    def __str__(self):
        return f"Paper ID: {self.paperId} for {self.email}"

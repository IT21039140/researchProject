# question_generator/models.py
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

    def __str__(self):
        return f"Paper ID: {self.paperId} - Description: {self.paperDes}"
    
class UserResponse(models.Model):
    email = models.EmailField()
    paperId = models.IntegerField()
    number_of_questions = models.IntegerField()
    user_score = models.IntegerField()

    class Meta:
        db_table = 'user_responses'

    def __str__(self):
        return f"{self.email} - Paper ID: {self.paperId}"

class QuestionResponse(models.Model):
    user_response = models.ForeignKey(UserResponse, related_name='questions', on_delete=models.CASCADE)
    question_number = models.IntegerField()
    question = models.TextField()
    options = models.JSONField()
    answered_correct = models.BooleanField()
    user_answer = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=255)

    class Meta:
        db_table = 'question_responses'

    def __str__(self):
        return f"Question {self.question_number} for Paper ID: {self.user_response.paperId}"
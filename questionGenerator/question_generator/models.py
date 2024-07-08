# question_generator/models.py
from djongo import models

class GeneratedQuestion(models.Model):
    question_number = models.IntegerField()
    question_text = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=100)

    class Meta:
        db_table = 'generated_questions'

    def __str__(self):
        return self.question_text

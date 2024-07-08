from pymongo import MongoClient
from .models import GeneratedQuestion
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .prompts import base_prompt
from .utils import generate_questions
from .processing import process_and_format_questions
# from dotenv import load_dotenv
import os

# load_dotenv()

class GenerateModelPaperAPIView(APIView):
    def check_mongodb_connection(self):
        """Check if the MongoDB connection is successful."""
        try:
            client = MongoClient(os.getenv('MONGO_URI'))
            client.server_info()  # Forces a call to the server to verify the connection
            return True
        except Exception as e:
            print(f'Error in MongoDB connection: {e}')
            return False

    def get(self, request):
        if not self.check_mongodb_connection():
            return Response(
                {"error": "Could not connect to the database. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        all_questions = []
        for i in range(3):
            raw_response = generate_questions(base_prompt)
            print(f"Raw Response: {raw_response}")
            questions = process_and_format_questions(raw_response)
            all_questions.extend(questions)

        # Save to MongoDB
        for question in all_questions:
            GeneratedQuestion.objects.create(
                question_number=question["question_number"],
                question_text=question["question"],
                options=question["options"],
                correct_answer=question["correct_answer"]
            )

        # Ensure each question gets a unique number
        for idx, question in enumerate(all_questions, start=1):
            question["question_number"] = idx

        return Response({"questions": all_questions}, status=status.HTTP_200_OK)
from .models import GeneratedITQuestions, UserPaper,UserResponse, QuestionResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .prompts import base_prompt
from .utils import generate_questions
from .processing import process_and_format_questions
import logging
from .ServiceClient import ServiceClient
import jwt
from django.conf import settings

log = logging.getLogger('questionGenerator')

class GenerateITModelPaperAPIView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get('email')

            # Retrieve access token from request headers
            access_token = request.headers.get('Authorization')
            if not access_token:
                log.error("Missing access token in request headers.")
                return Response(
                    {"error": "Authorization token is required."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Decode the token to check its validity
            try:
                jwt.decode(access_token.split(' ')[1], settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            except jwt.ExpiredSignatureError:
                log.error("The access token has expired.")
                return Response(
                    {"error": "The access token has expired."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except jwt.InvalidTokenError:
                log.error("The access token is invalid.")
                return Response(
                    {"error": "The access token is invalid."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            try:
                service_client = ServiceClient()
                user_details = service_client.get_user_details(user_id, access_token)
                log.info(f"User details retrieved: {user_details}")
            except Exception as e:
                log.error(f"Error accessing user details: {e}")
                return Response(
                    {"error": "Failed to access user details."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
            if not user_id:
                log.error("Missing userId in request payload.")
                return Response(
                    {"error": "userId is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generate a unique paperId
            try:
                last_paper = UserPaper.objects.all().order_by('paperId').last()
                paper_id = last_paper.paperId + 1 if last_paper else 1
                log.info(f"Generated unique paperId: {paper_id}")
            except Exception as e:
                log.error(f"Error generating unique paperId: {e}")
                return Response(
                    {"error": "Failed to generate a unique paperId."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Create UserPaper entry
            try:
                user_paper = UserPaper.objects.create(
                    user_id=user_id,
                    paperId=paper_id,
                    paperDes="IT paper",
                    number_of_questions=0  # This will be updated later
                )
                log.info(f"UserPaper created with paperId: {paper_id} for userId: {user_id}")
            except Exception as e:
                log.error(f"Error creating UserPaper entry: {e}")
                return Response(
                    {"error": "Failed to create UserPaper entry."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            all_questions = []
            for i in range(3):
                try:
                    raw_response = generate_questions(base_prompt)
                    log.debug(f"Raw Response from question generation: {raw_response}")
                    questions = process_and_format_questions(raw_response)
                    all_questions.extend(questions)
                except Exception as e:
                    log.error(f"Error generating questions: {e}")
                    return Response(
                        {"error": "Failed to generate questions."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Ensure each question gets a unique number and associate it with the paperId
            formatted_questions = []
            for idx, question in enumerate(all_questions, start=1):
                try:
                    question["question_number"] = idx
                    GeneratedITQuestions.objects.create(
                        question_number=question["question_number"],
                        question_text=question["question"],
                        options=question["options"],
                        correct_answer=question["correct_answer"],
                        paperId=paper_id
                    )
                    log.info(f"Saved question {idx} to GeneratedITQuestions with paperId: {paper_id}")

                    formatted_questions.append({
                        "question_number": idx,
                        "question": question["question"],
                        "options": question["options"],
                        "correct_answer": question["correct_answer"]
                    })
                except Exception as e:
                    log.error(f"Error saving question {idx} to database: {e}")
                    return Response(
                        {"error": f"Failed to save question {idx}."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Update the number_of_questions in the UserPaper entry
            try:
                user_paper.number_of_questions = len(all_questions)
                user_paper.save()
                log.info(f"Updated UserPaper with paperId: {paper_id} with number_of_questions: {len(all_questions)}")
            except Exception as e:
                log.error(f"Error updating UserPaper entry with paperId: {paper_id}: {e}")
                return Response(
                    {"error": "Failed to update UserPaper with the number of questions."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Prepare the response data
            response_data = {
                "email": user_id,
                "paperId": paper_id,
                "questions": formatted_questions
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Unexpected error in GenerateITModelPaperAPIView: {e}")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SaveUserResponseAPIView(APIView):
    def post(self, request):
        # Retrieve and validate the access token
        access_token = request.headers.get('Authorization')
        if not access_token:
            log.error("Missing access token in request headers.")
            return Response(
                {"error": "Authorization token is required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            jwt.decode(access_token.split(' ')[1], settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            log.error("The access token has expired.")
            return Response(
                {"error": "The access token has expired."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            log.error("The access token is invalid.")
            return Response(
                {"error": "The access token is invalid."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Extract data from the request
        email = request.data.get('email')
        paper_id = request.data.get('paperId')
        number_of_questions = request.data.get('number_of_questions')
        user_score = request.data.get('user_score')
        questions = request.data.get('questions')

        if not (email and paper_id and number_of_questions and user_score is not None and questions):
            log.error("Missing required fields in request payload.")
            return Response(
                {"error": "Missing required fields in request payload."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Create UserResponse
            user_response = UserResponse.objects.create(
                email=email,
                paperId=paper_id,
                number_of_questions=number_of_questions,
                user_score=user_score
            )

            # Create QuestionResponses
            for question in questions:
                QuestionResponse.objects.create(
                    user_response=user_response,
                    question_number=question.get('question_number'),
                    question=question.get('question'),
                    options=question.get('options'),
                    answered_correct=question.get('answered_correct'),
                    user_answer=question.get('user_answer'),
                    correct_answer=question.get('correct_answer')
                )

            log.info(f"User response saved successfully for email: {email}, paperId: {paper_id}")
            return Response({"message": "User response saved successfully."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            log.error(f"Error saving user response: {e}")
            return Response(
                {"error": "An error occurred while saving the response."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RetrieveUserResponseAPIView(APIView):
    def post(self, request):
        # Retrieve and validate the access token
        access_token = request.headers.get('Authorization')
        if not access_token:
            log.error("Missing access token in request headers.")
            return Response(
                {"error": "Authorization token is required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            jwt.decode(access_token.split(' ')[1], settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            log.error("The access token has expired.")
            return Response(
                {"error": "The access token has expired."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            log.error("The access token is invalid.")
            return Response(
                {"error": "The access token is invalid."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Extract email and paperId from the request
        email = request.data.get('email')
        paper_id = request.data.get('paperId')

        if not email or not paper_id:
            log.error("Missing email or paperId in request payload.")
            return Response(
                {"error": "Both email and paperId are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Retrieve UserResponse
            user_response = UserResponse.objects.get(email=email, paperId=paper_id)

            # Retrieve related QuestionResponses
            question_responses = QuestionResponse.objects.filter(user_response=user_response)

            # Format the response
            formatted_questions = []
            for question in question_responses:
                formatted_questions.append({
                    "question_number": question.question_number,
                    "question": question.question,
                    "options": question.options,
                    "answered_correct": question.answered_correct,
                    "user_answer": question.user_answer,
                    "correct_answer": question.correct_answer,
                })

            response_data = {
                "email": user_response.email,
                "paperId": user_response.paperId,
                "number_of_questions": user_response.number_of_questions,
                "user_score": user_response.user_score,
                "questions": formatted_questions
            }

            log.info(f"User response retrieved successfully for email: {email}, paperId: {paper_id}")
            return Response(response_data, status=status.HTTP_200_OK)

        except UserResponse.DoesNotExist:
            log.error(f"User response not found for email: {email}, paperId: {paper_id}")
            return Response(
                {"error": "User response not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            log.error(f"Error retrieving user response: {e}")
            return Response(
                {"error": "An error occurred while retrieving the response."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

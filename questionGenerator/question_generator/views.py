from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .prompts import base_prompt,law_question_prompt,alphabetical_order_prompt,preposition_prompt,homophones_prompt,verb_form_prompt,summary_prompt,analytical_essay_prompt
from .utils import generate_questions,generate_questions_for_law
from .processing import process_and_format_questions
import logging
import traceback
from .ServiceClient import ServiceClient
import jwt
from django.conf import settings
from pymongo import MongoClient
import datetime

# Initialize pymongo client
client = MongoClient(settings.MONGO_URI)
db = client['test']  # Access the 'test' database

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
            except jwt.ExpiredSignatureError as e:
                log.error("The access token has expired.")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
                return Response(
                    {"error": "The access token has expired."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except jwt.InvalidTokenError as e:
                log.error("The access token is invalid.")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
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
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
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
                last_paper = db.user_paper.find_one(sort=[("paperId", -1)])  # Find the last document
                paper_id = last_paper["paperId"] + 1 if last_paper else 1
                paper_des = "IT paper"
                log.info(f"Generated unique paperId: {paper_id}")
            except Exception as e:
                log.error(f"Error generating unique paperId: {e}")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
                return Response(
                    {"error": "Failed to generate a unique paperId."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Create UserPaper entry
            try:
                db.user_paper.insert_one({
                    'user_id': user_id,
                    'paperId': paper_id,
                    'paperDes': paper_des,
                    'number_of_questions': 0  # This will be updated later
                })
                log.info(f"UserPaper created with paperId: {paper_id} for userId: {user_id}")
            except Exception as e:
                log.error(f"Error creating UserPaper entry: {e}")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
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
                    log.error(f"An error occurred: {str(e)}")
                    log.error(f"Traceback: {traceback.format_exc()}")
                    return Response(
                        {"error": "Failed to generate questions."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Ensure each question gets a unique number and associate it with the paperId
            formatted_questions = []
            for idx, question in enumerate(all_questions, start=1):
                try:
                    question["question_number"] = idx
                    db.generated_it_questions.insert_one({
                        "question_number": question["question_number"],
                        "question_text": question["question"],
                        "options": question["options"],
                        "correct_answer": question["correct_answer"],
                        "paperId": paper_id
                    })
                    log.info(f"Saved question {idx} to GeneratedITQuestions with paperId: {paper_id}")

                    formatted_questions.append({
                        "question_number": idx,
                        "question": question["question"],
                        "options": question["options"],
                        "correct_answer": question["correct_answer"]
                    })
                except Exception as e:
                    log.error(f"Error saving question {idx} to database: {e}")
                    log.error(f"An error occurred: {str(e)}")
                    log.error(f"Traceback: {traceback.format_exc()}")
                    return Response(
                        {"error": f"Failed to save question {idx}."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Update the number_of_questions in the UserPaper entry
            try:
                db.user_paper.update_one(
                    {'paperId': paper_id},
                    {'$set': {'number_of_questions': len(all_questions)}}
                )
                log.info(f"Updated UserPaper with paperId: {paper_id} with number_of_questions: {len(all_questions)}")
            except Exception as e:
                log.error(f"Error updating UserPaper entry with paperId: {paper_id}: {e}")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
                return Response(
                    {"error": "Failed to update UserPaper with the number of questions."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Prepare the response data
            response_data = {
                "email": user_id,
                "paperId": paper_id,
                "paperDes": paper_des,  # Include paperDes in the response
                "questions": formatted_questions
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Unexpected error in GenerateITModelPaperAPIView: {e}")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
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
        except jwt.ExpiredSignatureError as e:
            log.error("The access token has expired.")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "The access token has expired."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError as e:
            log.error("The access token is invalid.")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "The access token is invalid."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Extract data from the request
        email = request.data.get('email')
        paper_id = request.data.get('paperId')
        paper_des = request.data.get('paperDes')  # New field for paper description
        number_of_questions = request.data.get('number_of_questions')
        user_score = request.data.get('user_score')
        questions = request.data.get('questions')

        if not (email and paper_id and number_of_questions and user_score is not None and questions and paper_des):
            log.error("Missing required fields in request payload.")
            return Response(
                {"error": "Missing required fields in request payload."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if UserResponse already exists
            user_response = db.user_responses.find_one({'email': email, 'paperId': paper_id})

            if user_response:
                # Update existing UserResponse
                db.user_responses.update_one(
                    {'email': email, 'paperId': paper_id},
                    {'$set': {
                        'paperDes': paper_des,  # Update paper description
                        'number_of_questions': number_of_questions,
                        'user_score': user_score
                    }}
                )
                # Set the user_response_id to the existing document's `_id`
                user_response_id = user_response['_id']
                db.question_responses.delete_many({'user_response_id': user_response_id})
            else:
                # Create new UserResponse
                new_user_response = db.user_responses.insert_one({
                    'email': email,
                    'paperId': paper_id,
                    'paperDes': paper_des,  # New paper description
                    'number_of_questions': number_of_questions,
                    'user_score': user_score
                })
                # Set the user_response_id to the newly inserted document's ID
                user_response_id = new_user_response.inserted_id

            # Create or update QuestionResponses
            for question in questions:
                db.question_responses.insert_one({
                    'user_response_id': user_response_id,
                    'question_number': question.get('question_number'),
                    'question': question.get('question'),
                    'options': question.get('options'),
                    'answered_correct': question.get('answered_correct'),
                    'user_answer': question.get('user_answer'),
                    'correct_answer': question.get('correct_answer')
                })

            log.info(f"User response saved/updated successfully for email: {email}, paperId: {paper_id}")
            return Response({"message": "User response saved/updated successfully."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            log.error(f"Error saving/updating user response: {e}")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "An error occurred while saving/updating the response."},
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
        except jwt.ExpiredSignatureError as e:
            log.error("The access token has expired.")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "The access token has expired."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError as e:
            log.error("The access token is invalid.")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
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
            user_response = db.user_responses.find_one({'email': email, 'paperId': paper_id})

            if not user_response:
                log.error(f"User response not found for email: {email}, paperId: {paper_id}")
                return Response(
                    {"error": "User response not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Retrieve related QuestionResponses
            question_responses = db.question_responses.find({'user_response_id': user_response['_id']})

            # Format the response
            formatted_questions = []
            for question in question_responses:
                formatted_questions.append({
                    "question_number": question['question_number'],
                    "question": question['question'],
                    "options": question['options'],
                    "answered_correct": question['answered_correct'],
                    "user_answer": question['user_answer'],
                    "correct_answer": question['correct_answer'],
                })

            response_data = {
                "email": user_response['email'],
                "paperId": user_response['paperId'],
                "paperDes": user_response['paperDes'],  # Include paper description
                "number_of_questions": user_response['number_of_questions'],
                "user_score": user_response['user_score'],
                "questions": formatted_questions
            }

            log.info(f"User response retrieved successfully for email: {email}, paperId: {paper_id}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Error retrieving user response: {e}")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "An error occurred while retrieving the response."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RetrieveUserGeneratedQuestionsAPIView(APIView):
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
        except jwt.ExpiredSignatureError as e:
            log.error("The access token has expired.")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "The access token has expired."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError as e:
            log.error("The access token is invalid.")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "The access token is invalid."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Extract email from the request
        email = request.data.get('email')
        if not email:
            log.error("Missing email in request payload.")
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Retrieve all UserPaper records for the user
            user_papers = list(db.user_paper.find({'user_id': email}))
            log.info(f"user_papers count for email: {len(user_papers)}")

            # Retrieve all UserResponse records for the user
            user_responses = list(db.user_responses.find({'email': email}))
            log.info(f"user_responses count for email: {len(user_responses)}")

            # Create sets of paper IDs
            answered_paper_ids = {response['paperId'] for response in user_responses}
            all_paper_ids = {paper['paperId'] for paper in user_papers}

            # Identify unanswered paper IDs
            unanswered_paper_ids = all_paper_ids - answered_paper_ids

            # Format the answered and unanswered lists
            answered = [{
                "paperId": response['paperId'],
                "paperDes": response['paperDes'],
                "number_of_questions": response['number_of_questions'],
                "user_score": response['user_score']
            } for response in user_responses]

            unanswered = [{
                "paperId": paper['paperId'],
                "paperDes": paper['paperDes'],
                "number_of_questions": paper['number_of_questions']
            } for paper in user_papers if paper['paperId'] in unanswered_paper_ids]

            response_data = {
                "answered": answered,
                "unanswered": unanswered
            }

            log.info(f"User-generated questions retrieved successfully for email: {email}")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Error retrieving user-generated questions: {e}")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "An error occurred while retrieving user-generated questions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RetrieveUnansweredQuestionsAPIView(APIView):
    def post(self, request):
        try:
            # Extract paperId from the request payload
            paper_id = request.data.get('paperId')

            if not paper_id:
                log.error("Missing paperId in request payload.")
                return Response(
                    {"error": "paperId is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Retrieve questions from the GeneratedITQuestions table for the given paperId
            try:
                questions = list(db.generated_it_questions.find({'paperId': paper_id}))

                if not questions:
                    log.error(f"No questions found for paperId: {paper_id}")
                    return Response(
                        {"error": "No questions found for the given paperId."},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Format the questions for response
                formatted_questions = []
                for question in questions:
                    formatted_questions.append({
                        "question_number": question.get('question_number'),
                        "question": question.get('question_text'),
                        "options": question.get('options'),
                        "correct_answer": question.get('correct_answer')  # Optional if needed

                    })

                response_data = {
                    "paperId": paper_id,
                    "questions": formatted_questions,
                    "paperDes": "IT Paper"
                }

                log.info(f"Questions retrieved successfully for paperId: {paper_id}")
                return Response(response_data, status=status.HTTP_200_OK)

            except Exception as e:
                log.error(f"Error retrieving questions for paperId: {paper_id}")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
                return Response(
                    {"error": "Failed to retrieve questions."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            log.error(f"Unexpected error in RetrieveUnansweredQuestionsAPIView: {e}")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DeletePaperAPIView(APIView):
    def delete(self, request):
        email = request.data.get('email')
        paper_id = request.data.get('paperId')

        if not email or not paper_id:
            log.error("Missing email or paperId in request payload.")
            return Response(
                {"error": "Both email and paperId are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Check if the UserPaper exists with the given email and paperId
            user_paper = db.user_paper.find_one({"user_id": email, "paperId": paper_id})

            if not user_paper:
                log.error(f"No paper found for email: {email}, paperId: {paper_id}")
                return Response(
                    {"error": "No paper found with the given email and paperId."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Delete associated questions from GeneratedITQuestions
            db.generated_it_questions.delete_many({"paperId": paper_id})
            log.info(f"Deleted questions associated with paperId: {paper_id}")

            # Delete the UserPaper entry
            db.user_paper.delete_one({"user_id": email, "paperId": paper_id})
            log.info(f"Deleted paper with paperId: {paper_id} for user_id: {email}")

            # Delete related user responses from UserResponse
            db.user_responses.delete_many({"email": email, "paperId": paper_id})
            log.info(f"Deleted user responses associated with paperId: {paper_id} for email: {email}")

            return Response(
                {"message": f"Paper with paperId {paper_id} for email {email} deleted successfully."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            log.error(f"Error deleting paper with paperId: {paper_id} for email: {email}")
            log.error(f"An error occurred: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "An unexpected error occurred while deleting the paper."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GenerateLawQuestionAPIView(APIView):
    def post(self, request):
        try:

            # Retrieve access token from request headers
            access_token = request.headers.get('Authorization')
            if not access_token:
                log.error("Missing access token in request headers.")
                return Response(
                    {"error": "Authorization token is required."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Decode and validate the JWT token
            try:
                jwt.decode(access_token.split(' ')[1], settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            except jwt.ExpiredSignatureError as e:
                log.error("The access token has expired.")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
                return Response(
                    {"error": "The access token has expired."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except jwt.InvalidTokenError as e:
                log.error("The access token is invalid.")
                log.error(f"An error occurred: {str(e)}")
                log.error(f"Traceback: {traceback.format_exc()}")
                return Response(
                    {"error": "The access token is invalid."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            log.info(f"Token is valid")

            email = request.data.get('email')
            if not email:
                return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Generate a unique paperId
            last_paper = db.generated_law_questions.find_one(sort=[("paperId", -1)])
            paper_id = last_paper["paperId"] + 1 if last_paper else 1
            log.info(f"old paperId  new paperid {paper_id}")

            # Proceed to generate the questions after token validation
            # Generate question set 1
            generated_content_set1 = generate_questions_for_law(law_question_prompt,135)
            if generated_content_set1.startswith("Error"):
                return Response({"error": generated_content_set1}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            log.info(f"Question 1 generated successfully")

            # Generate question set 2
            generated_content_set2 = generate_questions_for_law(alphabetical_order_prompt,270)
            if generated_content_set2.startswith("Error"):
                return Response({"error": generated_content_set2}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            log.info(f"Question 2 generated successfully")

            # Generate question set 3 (prepositions)
            generated_content_set3 = generate_questions_for_law(preposition_prompt,230)
            if generated_content_set3.startswith("Error"):
                return Response({"error": generated_content_set3}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            log.info(f"Question 3 generated successfully")

            # Generate question set 4 (homophones/confused words)
            generated_content_set4 = generate_questions_for_law(homophones_prompt,180)
            if generated_content_set4.startswith("Error"):
                return Response({"error": generated_content_set4}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            log.info(f"Question 4 generated successfully")

            # Generate question set 5 (verb forms)
            generated_content_set5 = generate_questions_for_law(verb_form_prompt,200)
            if generated_content_set5.startswith("Error"):
                return Response({"error": generated_content_set5}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            log.info(f"Question 5 generated success fully")

            # Generate question set 6 (summary)
            generated_content_set6 = generate_questions_for_law(summary_prompt,500)
            if generated_content_set6.startswith("Error"):
                return Response({"error": generated_content_set6}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            log.info(f"Question 6 generated successfully")

                # Generate question set 7 (analytical essay)
            generated_content_set7 = generate_questions_for_law(analytical_essay_prompt,100)
            if generated_content_set7.startswith("Error"):
                return Response({"error": generated_content_set7}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            log.info(f"Question 7 generated successfully")

            # Extract title and questions for questionSetNo1
            lines_set1 = generated_content_set1.split('\n')
            title_set1 = ""
            for line in lines_set1:
                if "In each of the questions" in line:
                    title_set1 = line
                    break
            questions_content_set1 = '\n'.join(lines_set1[1:]).strip() if title_set1 else generated_content_set1.strip()

            # Extract title and questions for questionSetNo2
            lines_set2 = generated_content_set2.split('\n')
            title_set2 = ""
            for line in lines_set2:
                if "In each of the questions" in line:
                    title_set2 = line
                    break
            questions_content_set2 = '\n'.join(lines_set2[1:]).strip() if title_set2 else generated_content_set2.strip()

            # Extract title and questions for questionSetNo3 (prepositions)
            lines_set3 = generated_content_set3.split('\n')
            title_set3 = ""
            for line in lines_set3:
                if "In each of the questions" in line:
                    title_set3 = line
                    break
            questions_content_set3 = '\n'.join(lines_set3[1:]).strip() if title_set3 else generated_content_set3.strip()

            # Extract title and questions for questionSetNo4 (homophones/confused words)
            lines_set4 = generated_content_set4.split('\n')
            title_set4 = ""
            for line in lines_set4:
                if "In each of the questions" in line:
                    title_set4 = line
                    break
            questions_content_set4 = '\n'.join(lines_set4[1:]).strip() if title_set4 else generated_content_set4.strip()

            # Extract title and questions for questionSetNo5 (verb forms)
            lines_set5 = generated_content_set5.split('\n')
            title_set5 = ""
            for line in lines_set5:
                if "In each of the questions" in line:
                    title_set5 = line
                    break
            questions_content_set5 = '\n'.join(lines_set5[1:]).strip() if title_set5 else generated_content_set5.strip()

            # Extract title and questions for questionSetNo6 (summary)
            lines_set6 = generated_content_set6.split('\n')
            title_set6 = ""
            for line in lines_set6:
                if "In each of the questions" in line:
                    title_set6 = line
                    break
            questions_content_set6 = '\n'.join(lines_set6[1:]).strip() if title_set6 else generated_content_set6.strip()

            lines_set7 = generated_content_set7.split('\n')
            title_set7 = ""
            for line in lines_set7:
                if "Write an analytical essay" in line:
                    title_set7 = line
                    break
            questions_content_set7 = '\n'.join(lines_set7[1:]).strip() if title_set7 else generated_content_set7.strip()

            # Format the response as JSON with all six question sets
            response_data = {
                "questionSetNo1": {
                    "title": title_set1 if title_set1 else "In each of the questions from No. 1 to 3, select the Incorrectly spelt word and write the number of the relevant choice on the dotted line provided against each question. (03 marks)",
                    "questions": questions_content_set1
                },
                "questionSetNo2": {
                    "title": title_set2 if title_set2 else "In each of the questions from No. 4 to 6, rearrange the words in the alphabetical order; check with the answers given and write the appropriate number of the relevant choice on the dotted line provided against each question. (03 marks)",
                    "questions": questions_content_set2
                },
                "questionSetNo3": {
                    "title": title_set3 if title_set3 else "In each of the questions from No. 7 to 11, select the most appropriate preposition to fill in the blank and write the number of the relevant choice on the dotted line provided against each question. (05 marks)",
                    "questions": questions_content_set3
                },
                "questionSetNo4": {
                    "title": title_set4 if title_set4 else "In each of the questions from No. 12 to 15, underline the correct option to fill in the blank. (04 marks)",
                    "questions": questions_content_set4
                },
                "questionSetNo5": {
                    "title": title_set5 if title_set5 else "In questions from No. 16 to 21, fill in each blank with a suitable form of the verb provided within brackets. (06 marks)",
                    "questions": questions_content_set5
                },
                "questionSetNo6": {
                    "title": title_set6 if title_set6 else "Read the following text and summarize it into one-third of its length and give a suitable title. Indicate the number of words used at the end. (15 marks)",
                    "questions": questions_content_set6
                },
                "questionSetNo7":{
                    "title": title_set7 if title_set7 else "Write on analytical essay on the following topic using about 300 words. (25 marks)",
                    "questions": questions_content_set7
                }
            }
            question_sets=[ {
                    "title": title_set1 if title_set1 else "In each of the questions from No. 1 to 3, select the Incorrectly spelt word and write the number of the relevant choice on the dotted line provided against each question. (03 marks)",
                    "questions": questions_content_set1,
                    "question_set_no": 1
                },
                {
                    "title": title_set2 if title_set2 else "In each of the questions from No. 4 to 6, rearrange the words in the alphabetical order; check with the answers given and write the appropriate number of the relevant choice on the dotted line provided against each question. (03 marks)",
                    "questions": questions_content_set2,
                    "question_set_no": 2
                },
                {
                    "title": title_set3 if title_set3 else "In each of the questions from No. 7 to 11, select the most appropriate preposition to fill in the blank and write the number of the relevant choice on the dotted line provided against each question. (05 marks)",
                    "questions": questions_content_set3,
                    "question_set_no": 3
                },
                {
                    "title": title_set4 if title_set4 else "In each of the questions from No. 12 to 15, underline the correct option to fill in the blank. (04 marks)",
                    "questions": questions_content_set4,
                    "question_set_no": 4
                },
                {
                    "title": title_set5 if title_set5 else "In questions from No. 16 to 21, fill in each blank with a suitable form of the verb provided within brackets. (06 marks)",
                    "questions": questions_content_set5,
                    "question_set_no": 5
                },
                {
                    "title": title_set6 if title_set6 else "Read the following text and summarize it into one-third of its length and give a suitable title. Indicate the number of words used at the end. (15 marks)",
                    "questions": questions_content_set6,
                    "question_set_no": 6
                },
                {
                    "title": title_set7 if title_set7 else "Write on analytical essay on the following topic using about 300 words. (25 marks)",
                    "questions": questions_content_set7,
                    "question_set_no": 7
                }
            ]

            law_questions_data = {
                "email": email,
                "paperId": paper_id,
                "generated_datetime": datetime.datetime.utcnow(),
                "questions": question_sets
            }

            # Insert the generated questions into
            # Insert the generated questions into MongoDB
            try:
                db.generated_law_questions.insert_one(law_questions_data)
                log.info(f"Law questions saved successfully for email: {email}, paperId: {paper_id}")
            except Exception as e:
                log.error(f"Error in save low question {str(e)}")
                return Response({"error": "A paper with this ID already exists."}, status=status.HTTP_409_CONFLICT)

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Error generating law questions: {str(e)}")
            log.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {"error": "An error occurred while generating law questions."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RetrieveUserPapersAPIView(APIView):
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
            # Decode and validate the JWT token
            jwt.decode(access_token.split(' ')[1], settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError as e:
            log.error("The access token has expired.")
            return Response(
                {"error": "The access token has expired."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError as e:
            log.error("The access token is invalid.")
            return Response(
                {"error": "The access token is invalid."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # If token is valid, proceed with fetching papers
        try:
            # Retrieve email from the request payload
            email = request.data.get('email')
            if not email:
                log.error("Missing email in request payload.")
                return Response(
                    {"error": "Email is required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Query the generated law questions for the specified email
            user_papers = db.generated_law_questions.find({"email": email})

            # If no papers are found, return an empty response
            if not user_papers:
                log.info(f"No papers found for email: {email}")
                return Response(
                    {"message": "No papers found for the specified user."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Prepare the response data with paperId, number_of_questions, and paper description
            paper_details = []
            for paper in user_papers:
                paper_details.append({
                    "paperId": paper.get("paperId"),
                    "number_of_questions": len(paper.get("questions", [])),
                    "paper_description": "Law Paper"  # Fixed description; can be adjusted based on specific requirements
                })

            return Response({"papers": paper_details}, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Error retrieving papers: {str(e)}")
            return Response(
                {"error": "An error occurred while retrieving papers."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RetrieveSingleLawPaperAPIView(APIView):
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
            # Decode and validate the JWT token
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

        # Extract paperId and email from the request payload
        email = request.data.get('email')
        paper_id = request.data.get('paperId')
        if not email or not paper_id:
            log.error("Missing email or paperId in request payload.")
            return Response(
                {"error": "Both email and paperId are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Retrieve the paper from the database
            paper = db.generated_law_questions.find_one({"email": email, "paperId": paper_id})
            if not paper:
                log.error(f"Paper not found for email: {email}, paperId: {paper_id}")
                return Response(
                    {"error": "Paper not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Format the questions into the specified response structure
            response_data = {}
            for i, question_set in enumerate(paper['questions'], start=1):
                question_set_key = f"questionSetNo{i}"
                response_data[question_set_key] = {
                    "title": question_set.get("title"),
                    "questions": question_set.get("questions")
                }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Error retrieving single paper: {str(e)}")
            return Response(
                {"error": "An error occurred while retrieving the paper."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeleteLawQuestionPaperAPIView(APIView):
    def delete(self, request):
        # Retrieve and validate the access token
        access_token = request.headers.get('Authorization')
        if not access_token:
            log.error("Missing access token in request headers.")
            return Response(
                {"error": "Authorization token is required."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            # Decode and validate the JWT token
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

        # Extract paperId and email from the request payload
        email = request.data.get('email')
        paper_id = request.data.get('paperId')
        if not email or not paper_id:
            log.error("Missing email or paperId in request payload.")
            return Response(
                {"error": "Both email and paperId are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Attempt to delete the specified paper
            result = db.generated_law_questions.delete_one({"email": email, "paperId": paper_id})
            if result.deleted_count == 0:
                log.error(f"Paper not found for email: {email}, paperId: {paper_id}")
                return Response(
                    {"error": "Paper not found or already deleted."},
                    status=status.HTTP_404_NOT_FOUND
                )

            log.info(f"Paper with paperId: {paper_id} deleted successfully for email: {email}")
            return Response({"message": "Paper deleted successfully."}, status=status.HTTP_200_OK)

        except Exception as e:
            log.error(f"Error deleting law question paper: {str(e)}")
            return Response(
                {"error": "An error occurred while deleting the paper."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# class GenerateLawQuestionAPIView(APIView):
#     def post(self, request):
#         try:
#             # Generate question set 1
#             generated_content_set1 = generate_questions_for_law(law_question_prompt,135)
#             if generated_content_set1.startswith("Error"):
#                 return Response({"error": generated_content_set1}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#
#             # Generate question set 2
#             generated_content_set2 = generate_questions_for_law(alphabetical_order_prompt,270)
#             if generated_content_set2.startswith("Error"):
#                 return Response({"error": generated_content_set2}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#
#             # Generate question set 3 (prepositions)
#             generated_content_set3 = generate_questions_for_law(preposition_prompt,230)
#             if generated_content_set3.startswith("Error"):
#                 return Response({"error": generated_content_set3}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#
#             # Generate question set 4 (homophones/confused words)
#             generated_content_set4 = generate_questions_for_law(homophones_prompt,180)
#             if generated_content_set4.startswith("Error"):
#                 return Response({"error": generated_content_set4}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#
#             # Extract title and questions for questionSetNo1
#             lines_set1 = generated_content_set1.split('\n')
#             title_set1 = ""
#             for line in lines_set1:
#                 if "In each of the questions" in line:
#                     title_set1 = line
#                     break
#             questions_content_set1 = '\n'.join(lines_set1[1:]).strip() if title_set1 else generated_content_set1.strip()
#
#             # Extract title and questions for questionSetNo2
#             lines_set2 = generated_content_set2.split('\n')
#             title_set2 = ""
#             for line in lines_set2:
#                 if "In each of the questions" in line:
#                     title_set2 = line
#                     break
#             questions_content_set2 = '\n'.join(lines_set2[1:]).strip() if title_set2 else generated_content_set2.strip()
#
#             # Extract title and questions for questionSetNo3 (prepositions)
#             lines_set3 = generated_content_set3.split('\n')
#             title_set3 = ""
#             for line in lines_set3:
#                 if "In each of the questions" in line:
#                     title_set3 = line
#                     break
#             questions_content_set3 = '\n'.join(lines_set3[1:]).strip() if title_set3 else generated_content_set3.strip()
#
#             # Extract title and questions for questionSetNo4 (homophones/confused words)
#             lines_set4 = generated_content_set4.split('\n')
#             title_set4 = ""
#             for line in lines_set4:
#                 if "In each of the questions" in line:
#                     title_set4 = line
#                     break
#             questions_content_set4 = '\n'.join(lines_set4[1:]).strip() if title_set4 else generated_content_set4.strip()
#
#             # Format the response as JSON with all four question sets
#             response_data = {
#                 "questionSetNo1": {
#                     "title": title_set1 if title_set1 else "In each of the questions from No. 1 to 3, select the Incorrectly spelt word and write the number of the relevant choice on the dotted line provided against each question. (03 marks)",
#                     "questions": questions_content_set1
#                 },
#                 "questionSetNo2": {
#                     "title": title_set2 if title_set2 else "In each of the questions from No. 4 to 6, rearrange the words in the alphabetical order; check with the answers given and write the appropriate number of the relevant choice on the dotted line provided against each question. (03 marks)",
#                     "questions": questions_content_set2
#                 },
#                 "questionSetNo3": {
#                     "title": title_set3 if title_set3 else "In each of the questions from No. 7 to 11, select the most appropriate preposition to fill in the blank and write the number of the relevant choice on the dotted line provided against each question. (05 marks)",
#                     "questions": questions_content_set3
#                 },
#                 "questionSetNo4": {
#                     "title": title_set4 if title_set4 else "In each of the questions from No. 12 to 15, underline the correct option to fill in the blank. (04 marks)",
#                     "questions": questions_content_set4
#                 }
#             }
#
#             return Response(response_data, status=status.HTTP_200_OK)
#
#         except Exception as e:
#             log.error(f"Error generating law questions: {str(e)}")
#             log.error(f"Traceback: {traceback.format_exc()}")
#             return Response(
#                 {"error": "An error occurred while generating law questions."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )
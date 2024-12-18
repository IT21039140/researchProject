# # question_generator/utils.py
# import openai
# from researchProject.settings import OPENAI_API_KEY

# openai.api_key = OPENAI_API_KEY

# def generate_questions(prompt: str, max_tokens=300) -> str:
#     response = openai.Completion.create(
#         model="gpt-3.5-turbo-0125",
#         prompt=prompt,
#         max_tokens=max_tokens,
#         temperature=0.7
#     )
#     return response.choices[0].text.strip()

# question_generator/utils.py
import openai
from django.conf import settings
from openai.error import RateLimitError, APIError, AuthenticationError
import logging

log = logging.getLogger('questionGenerator')
openai.api_key = settings.OPENAI_API_KEY

def generate_questions(prompt: str, max_tokens=500) -> str:
    try:
        response = openai.ChatCompletion.create(
            model="ft:gpt-3.5-turbo-0125:personal::9LtwLaaa",
            messages=[{"role": "system", "content": "You are an expert in creating aptitude test questions."},
                      {"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.7
        )
        return response.choices[0].message['content'].strip()
    except RateLimitError as e:
        print(str(e))
        return "Error: Rate limit exceeded. Check your quota and billing details."
    except AuthenticationError as e:
        print(str(e))
        return "Error: Authentication failed. Check your API key."
    except APIError as e:
        return f"Error: An API error occurred. {str(e)}"

def generate_questions_for_law(prompt: str, max_tokens: int) -> str:
    try:
        response = openai.ChatCompletion.create(
            # model="ft:gpt-4o-mini-2024-07-18:personal::A5QBObhf",
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are an expert in creating aptitude test questions."},
                      {"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            temperature=0.7
        )
        return response.choices[0].message['content'].strip()
    except RateLimitError as e:
        print(str(e))
        return "Error: Rate limit exceeded. Check your quota and billing details."
    except AuthenticationError as e:
        print(str(e))
        return "Error: Authentication failed. Check your API key."
    except APIError as e:
        return f"Error: An API error occurred. {str(e)}"

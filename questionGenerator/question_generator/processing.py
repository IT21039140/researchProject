# question_generator/processing.py
import re

def process_and_format_questions(raw_response: str) -> list:
    """
    Process the raw response from OpenAI and return a formatted list of questions.
    """
    question_pattern = re.compile(r"(\d+)\.\s*(.*?)\n\s*(A.*?)\n\s*(B.*?)\n\s*(C.*?)\n\s*(D.*?)\n\s*Correct answer:\s*(.*?)(?=\n\d+\.|\Z)", re.DOTALL)

    questions = []
    matches = question_pattern.findall(raw_response)

    for match in matches:
        print(f'Questions: {match}')
        question_number, question, option_a, option_b, option_c, option_d, correct_answer = match
        questions.append({
            "question_number": int(question_number),
            "question": question.strip(),
            "options": [option_a.strip(), option_b.strip(), option_c.strip(), option_d.strip()],
            "correct_answer": correct_answer.strip()
        })

    return questions

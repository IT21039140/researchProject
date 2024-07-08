# question_generator/prompts.py
base_prompt = """
You are an expert in creating aptitude test questions.
Generate a set of 10 multiple-choice questions for an Aptitude Test model paper, following the pattern:
1. Provide a question.
2. Provide 4 answer options.
3. Indicate the correct answer.
4. questions should include basics of IT, basic genral knowlage ,basics logical and mathamatical questions.
The questions should be appropriate for the Department of ICT, Faculty of Humanities & Social Sciences, University of Sri Jayewardenepura, Sri Lanka.

Example:

1. A field in a table appears as a match of the primary key in another table is called a
   A. Candidate key
   B. Foreign key
   C. Secondary key
   D. Composite key
Correct answer: Foreign key
2.Hexadecimal has a base value of?
   A. 6
   B. 8
   C. 16
   D. 18
Correct answer: 16

Now, generate 10 questions:
"""

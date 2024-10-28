# question_generator/prompts.py
base_prompt = """
You are an expert in creating aptitude test questions.
Generate a set of 10 multiple-choice questions for an Aptitude Test model paper, following the pattern:
1. Provide a question.
2. Provide 4 answer options.
3. Indicate the correct answer.
4. questions should include basics of IT, basic general knowledge ,basics logical and mathematical questions.
The questions should be appropriate for the Department of ICT, Faculty of Humanities & Social Sciences, University of Sri Jayewardenepura, Sri Lanka.

Example:

1. A field in a table appears as a match of the primary key in another table is called a
   A. Candidate key
   B. Foreign key
   C. Secondary key
   D. Composite key
Correct answer: B. Foreign key
2.Hexadecimal has a base value of?
   A. 6
   B. 8
   C. 16
   D. 18
Correct answer: C. 16

Now, generate 10 questions:
"""

law_question_prompt = (
    "Generate a set of questions similar to the example below. "
    "Each question should provide four words, where one word is spelled incorrectly. "
    "The student needs to identify the incorrectly spelled word and mark the corresponding number "
    "on the dotted line provided. Follow this structure exactly, and ensure that only one word in each set "
    "is spelled incorrectly. Make sure the incorrect spellings are subtle but plausible.\n\n"
    "Example:\n\n"
    "1.\n"
    "(1) practioner\n"
    "(2) precausion\n"
    "(3) predominant\n"
    "(4) preconception\n"
    "(......)\n\n"
    "2.\n"
    "(1) referendum\n"
    "(2) superintendent\n"
    "(3) survellance\n"
    "(4) irrespective\n"
    "(......)\n\n"
    "3.\n"
    "(1) reemitment\n"
    "(2) magnifisent\n"
    "(3) psychological\n"
    "(4) sympathetic\n"
    "(......)\n\n"
    "Generate a new set of questions in this exact format using words related to common English vocabulary "
    "and ensuring only one word in each set is misspelled."
    "only generate one set of question this is a must"
    "now please generate the questions."
)

alphabetical_order_prompt = """
You are an expert in creating aptitude test questions.

Generate three multiple-choice questions where students are required to rearrange four words in alphabetical order.
Each question should have four words labeled A, B, C, D. Provide four answer options for each question, where each option lists the words in different orders.

Format:
4.
(A) reckless
(B) recollect
(C) recent
(D) recognition
(1) C, A, B, D
(2) B, A, D, C
(3) C, A, D, B
(4) A, C, B, D
(.......)

5.
(A) scurry
(B) screen
(C) sculpture
(D) scrutiny
(1) A, B, C, D
(2) B, D, C, A
(3) C, D, B, A
(4) D, B, A, C
(.......)

6.
(A) morality
(B) morgue
(C) morbid
(D) morning
(1) B, A, D, C
(2) A, C, B, D
(3) A, D, C, B
(4) B, D, A, C
(.......)

only generate one set of questions this is a must
now please generate the question. 
"""

# prompts.py

# The new prompt for generating question set 3
preposition_prompt = """
You are an expert in creating aptitude test questions.

Generate five multiple-choice questions where students are required to select the most appropriate preposition to fill in the blanks.
Each question should provide four preposition options labeled 1, 2, 3, 4.
below is an example

Format:
A decision can be made only after a full inquiry is made ... the matter.
(1) into (2) of (3) on (4) about (.........)

The speaker took a long time to get ... the crux of his argument.
(1) off (2) onto (3) up to (4) down to (.........)

Our parents were warned as it was 10 o’clock ... the time we reached home.
(1) at (2) by (3) on (4) after (.........)

After the meeting, every participant was invited ... dinner by the chairman.
(1) for (2) into (3) of (4) at (.........)

It was clear that the chairman took great pleasure ... commending his committee members for their support.
(1) at (2) for (3) in (4) about (.........)

only generate one set of question this is a must and give only the questions
now please generate the question.
"""

homophones_prompt = """
You are an expert in creating aptitude test questions.

Create four fill-in-the-blank sentences where students must select between two given options to complete the sentence, similar to homophones or easily confused words.(do not give the correct answers)

Format:

12. Most people enjoy reading ........ (historic / historical) novels. Such a novel generally has a plot set in history.

13. In many countries, steps have been taken to ..........(Advice / advise) Judges to avoid social media as much as possible.

14. As revealed in court yesterday, the victim had been threatened by the accused to keep ....... (quiet / quite) about the assault.

15. According to some recent measures taken by New Zealand Human Rights Commission, people ......... (affected / effected) by domestic violence receive more legal protection.

only generate one set of question this is a must
now please generate the question.

"""

# prompts.py

# The new prompt for generating question set 5
verb_form_prompt = """
You are an expert in creating aptitude test questions.

Create six fill-in-the-blank sentences where students must choose the correct form of a verb provided in brackets. 


16. Ravi is a legal officer at a private bank in Colombo, and he often (go) .......... abroad on business trips.
17. Last week, he had to go to Tokyo, but he almost (miss) .......... his flight.
18. He (stand) ............ in the queue at the check-in desk when he suddenly (realize) .......... that he (leave) ............ his passport at home.
21. Fortunately, Ravi lives near the airport, so he (have) ........... time to take a taxi home to get it. He got to the airport just in time for the flight.

only generate one set of question this is a must
now please generate the question.

"""
summary_prompt = """
You are an expert in creating aptitude test questions.

Write a passage (more tha 300 words) on an educational or societal topic, asking students to summarize it into one-third of its length, provide a suitable title, and indicate the word count.

Example:
Colebrooke’s motivation with regard to education can only be judged from what he has
written in his report. What he has not written is probably more significant than what he has
written, From the time North took over the Governorship of the Island up to the time of
Colebrooke’s report, three motives may be discerned in educational activity, namely, religious,
humanitarian, and utilitarian.
...

title: ........

only generate one set of question this is a must
now please generate the questions.
"""

analytical_essay_prompt = """
You are an expert in creating aptitude test questions.

generate question that asks the student to write essay for specific topic and ask students to write an analytical essay follow below example.

Example question:

A debate exists in contemporary Sri Lankan society on the segregation of schools based on
gender, ethnicity, language or religion. Some people argue that such segregation has more
advantages thon disadvantages. However, others hold the opposite view. What Is your opinion
on this?

Use specific reasons and examples to support your view.

Title:..........................

only generate one set of question this is a must
now please generate the questions.

"""

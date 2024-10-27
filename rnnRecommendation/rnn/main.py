from fastapi import FastAPI
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import pickle
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

# Load the model and tokenizer
model = load_model('rnn_recommendation_model.h5')

with open('tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)

# Define features
features = ['What courses did you undertake to prepare for your current job role?',
            'Certification (if any):',
            'Programming Languages Proficient In:',
            'Specialized IT Skills',
            'What additional skills have you acquired to excel in your career?',
            'What motivated you to choose a career in the IT sector?',
            'What advice would you give to students aspiring to enter the IT sector?',
            'Did you participate in any extracurricular activities related to IT during your university years?',
            'What role do mentorship and guidance play in your career advancement?',
            'How do you stay updated with the latest trends and technologies in the IT sector?',
            'What is your long-term career goal within the IT sector?']

# Initialize FastAPI app
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


class StudentData(BaseModel):
    first_job_role: str
    dream_job_title: str

# Define the recommendation endpoint
@app.post("/recommendation/")
def rnn_recommendations(data: StudentData):
    print(data)
    
    # Load the dataset
    
    df = pd.read_csv('ppData_1.csv')  

    job_data = df[(df['First job role in the IT sector :'] == data.first_job_role) & (df['Current Job Title:'] == data.dream_job_title)]
    
    if job_data.empty:
        return {"error": "No data found for the given job roles."}

    combined_features = ' '.join(str(job_data[feature].values[0]) for feature in features)
    seq = tokenizer.texts_to_sequences([combined_features])
    padded = pad_sequences(seq, maxlen=200)
    pred = model.predict(padded)
    predicted_job_index = np.argmax(pred)
    recommended_job = df.iloc[predicted_job_index]

    courses = recommended_job['What courses did you undertake to prepare for your current job role?']
    certifications = recommended_job['Certification (if any):']
    languages = recommended_job['Programming Languages Proficient In:']
    skills = recommended_job['Specialized IT Skills']
    advice = recommended_job['What advice would you give to students aspiring to enter the IT sector?']
    extracurricular = recommended_job['Did you participate in any extracurricular activities related to IT during your university years?']
    mentorship = recommended_job['What role do mentorship and guidance play in your career advancement?']
    update = recommended_job['How do you stay updated with the latest trends and technologies in the IT sector?']
    goal = recommended_job['What is your long-term career goal within the IT sector?']

    recommendation = f"For the job role '{data.dream_job_title}', you can do the following:\n"
    if courses:
        recommendation += f"- You can undertake courses like: {courses}\n"
    if certifications:
        recommendation += f"- You can do Certifications like: {certifications}\n"
    if languages:
        recommendation += f"- You need to develop programming languages like: {languages}\n"
    if skills:
        recommendation += f"- Specialize in IT Skills: {skills}\n"
    if advice:
        recommendation += f"- Advice for students aspiring to enter the IT sector: {advice}\n"
    if extracurricular:
        recommendation += f"- You can participate in extracurricular activities related to IT during your university years: {extracurricular}\n"
    if mentorship:
        recommendation += f"- Mentorship and guidance play a role in career advancement: {mentorship}\n"
    if update:
        recommendation += f"- You can stay updated with the latest trends and technologies in the IT sector by: {update}\n"

    recommendation = {
        "courses": courses,
        "certifications": certifications,
        "languages": languages,
        "skills": skills,
        "advice": advice,
        "extracurricular":extracurricular,
        "mentorship":mentorship,
        "update":update
    }

    return {"recommendation": recommendation}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
import React, { useState } from 'react';
import axios from 'axios';

function GenerateQuestions() {
  const [showLawDropdown, setShowLawDropdown] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const toggleDropdown = () => {
    setShowLawDropdown(!showLawDropdown);
  };

  const handleITQuestionsClick = async () => {
    const token = localStorage.getItem('access_token'); // Retrieve the JWT token from localStorage
    // console.log("access_token :::::"+token)

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/service1/generate-ITmodel-paper/', {
        headers: {
          Authorization: `Bearer ${token}`, // Include the JWT token in the Authorization header
        },
      });
      setQuestions(response.data.questions);
      setShowResults(false);
      setUserAnswers({});
      setScore(0);
    } catch (error) {
      console.error('Error fetching IT questions:', error);
      // Handle error, such as redirecting to login if unauthorized
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
        // Optionally, redirect to login page
      }
    }
  };

  const normalizeAnswer = (answer) => {
    return answer.replace(/^[A-D]\.\s*/, '').trim().toLowerCase();
  };

  const handleAnswerChange = (questionNumber, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber]: answer,
    }));
  };

  const handleSubmit = () => {
    let correctAnswersCount = 0;
    questions.forEach((question) => {
      const normalizedUserAnswer = normalizeAnswer(userAnswers[question.question_number] || '');
      const normalizedCorrectAnswer = normalizeAnswer(question.correct_answer || '');
      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        correctAnswersCount++;
      }
    });
    setScore(correctAnswersCount);
    setShowResults(true);
  };

  return (
    <div>
      <h2>Generate Questions</h2>
      <div className="additional-buttons">
        <div className="dropdown-container">
          <button className="additional-button" onClick={toggleDropdown}>
            Law Questions
          </button>
          {showLawDropdown && (
            <div className="dropdown-content">
              <ul>
                <li>Law Question type 1</li>
                <li>Law Question type 2</li>
                <li>Law Question type 3</li>
              </ul>
            </div>
          )}
        </div>
        <button className="additional-button" onClick={handleITQuestionsClick}>
          IT Questions
        </button>
      </div>

      {questions.length > 0 && (
        <div className="quiz-container">
          <h3>IT Questions</h3>
          {questions.map((question) => (
            <div key={question.question_number} className="question-item">
              <p>{question.question_number}. {question.question}</p>
              <div className="options">
                {question.options.map((option, index) => (
                  <div key={index} className="option-item">
                    <input
                      type="radio"
                      id={`question-${question.question_number}-option-${index}`}
                      name={`question-${question.question_number}`}
                      value={option}
                      onChange={() => handleAnswerChange(question.question_number, option)}
                      disabled={showResults}
                    />
                    <label htmlFor={`question-${question.question_number}-option-${index}`}>
                      {option}
                    </label>
                  </div>
                ))}
              </div>

              {showResults && (
                <div className="result">
                  <p>Correct Answer: {question.correct_answer}</p>
                  {normalizeAnswer(userAnswers[question.question_number]) === normalizeAnswer(question.correct_answer) ? (
                    <p style={{ color: 'green' }}>You answered correctly!</p>
                  ) : (
                    <p style={{ color: 'red' }}>Your answer: {userAnswers[question.question_number]}</p>
                  )}
                </div>
              )}
            </div>
          ))}
          {!showResults && (
            <button className="submit-button" onClick={handleSubmit}>
              Submit Answers
            </button>
          )}
          {showResults && (
            <div className="score">
              <h3>Your Score: {score} / {questions.length}</h3>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GenerateQuestions;

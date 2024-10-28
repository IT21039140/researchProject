import React, { useState } from 'react'; 
import axios from 'axios';
import LawQuestionsComponent from './LawQuestionsComponent'; // Import the LawQuestionsComponent
import ITQuestionsComponent from './ITQuestionsComponent'; // Import the ITQuestionsComponent

function GenerateQuestions() {
  const [questions, setQuestions] = useState([]);
  const [lawQuestions, setLawQuestions] = useState(null); // State for law questions
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [paperId, setPaperId] = useState(null);
  const [paperDes, setPaperDes] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isITQuestions, setIsITQuestions] = useState(false); // To check which type of questions are being generated

  const handleITQuestionsClick = async () => {
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('email');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/service1/generate-ITmodel-paper/', 
      { email }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setQuestions(response.data.questions);
      setPaperId(response.data.paperId);
      setPaperDes(response.data.paperDes);
      setShowResults(false);
      setUserAnswers({});
      setScore(0);
      setMessage('');
      setIsITQuestions(true); // Flag to show IT Questions
      setLawQuestions(null);  // Clear Law questions
    } catch (error) {
      console.error('Error fetching IT questions:', error);
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
      }
    }
  };

  const handleLawQuestionsClick = async () => {
    const token = localStorage.getItem('access_token'); // Fetch the token from localStorage

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/service1/generate-law-lang-paper/',
        {}, // Send an empty body, as no request data is required here
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );
      setLawQuestions(response.data); // Set the law questions
      setQuestions([]);  // Clear IT questions
      setIsITQuestions(false); // Flag to show Law Questions
    } catch (error) {
      console.error('Error fetching law questions:', error);
    }
  };

  // Updated normalizeAnswer function to handle undefined answers
  const normalizeAnswer = (answer) => {
    if (!answer) return ''; // Return an empty string if answer is undefined or empty
    return answer.replace(/^[A-D]\.\s*/, '').trim().toLowerCase();
  };

  const handleAnswerChange = (questionNumber, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber]: answer,
    }));
  };

  return (
    <div>
      <h2>Generate Questions</h2>
      <div className="additional-buttons">
        <button className="additional-button" onClick={handleLawQuestionsClick}>
          Law Questions
        </button>
        <button className="additional-button" onClick={handleITQuestionsClick}>
          IT Questions
        </button>
      </div>

      {/* Use ITQuestionsComponent to display IT questions */}
      {isITQuestions && questions.length > 0 && (
        <ITQuestionsComponent
          questions={questions}
          userAnswers={userAnswers}
          handleAnswerChange={handleAnswerChange}
          normalizeAnswer={normalizeAnswer}
          showResults={showResults}
          setShowResults={setShowResults}
          setScore={setScore}
          score={score}
          setMessage={setMessage}
          setMessageType={setMessageType}
          paperId={paperId}
          paperDes={paperDes}
        />
      )}

      {/* Display Law Questions */}
      {lawQuestions && <LawQuestionsComponent questionSets={lawQuestions} />}

      {/* Display message */}
      {message && (
        <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default GenerateQuestions;

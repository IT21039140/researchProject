import React, { useState } from 'react'; 
import axios from 'axios';
import LawQuestionsComponent from './LawQuestionsComponent'; 
import ITQuestionsComponent from './ITQuestionsComponent'; 

function GenerateQuestions() {
  const [questions, setQuestions] = useState([]);
  const [lawQuestions, setLawQuestions] = useState(null); 
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [paperId, setPaperId] = useState(null);
  const [paperDes, setPaperDes] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isITQuestions, setIsITQuestions] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state

  const handleITQuestionsClick = async () => {
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('email');
    setLoading(true); // Start loading

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
      setIsITQuestions(true); 
      setLawQuestions(null);  
    } catch (error) {
      console.error('Error fetching IT questions:', error);
      if (error.response && error.response.status === 401) {
        alert('Session expired. Please log in again.');
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleLawQuestionsClick = async () => {
    const token = localStorage.getItem('access_token'); 
    const email = localStorage.getItem('email');
    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/service1/generate-law-lang-paper/',
        {email}, 
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );
      setLawQuestions(response.data); 
      setQuestions([]); 
      setIsITQuestions(false);
    } catch (error) {
      console.error('Error fetching law questions:', error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const normalizeAnswer = (answer) => {
    if (!answer) return ''; 
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
          English laguage/Law Questions
        </button>
        <button className="additional-button" onClick={handleITQuestionsClick}>
          IT Questions
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <p>Loading...</p>
        </div>
      ) : (
        <>
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

          {lawQuestions && <LawQuestionsComponent questionSets={lawQuestions} />}

          {message && (
            <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GenerateQuestions;

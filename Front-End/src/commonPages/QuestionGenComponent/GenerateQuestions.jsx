// import React, { useState } from 'react';
// import axios from 'axios';

// function GenerateQuestions() {
//   const [showLawDropdown, setShowLawDropdown] = useState(false);
//   const [questions, setQuestions] = useState([]);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [showResults, setShowResults] = useState(false);
//   const [score, setScore] = useState(0);
//   const [paperId, setPaperId] = useState(null); // State for paperId
//   const [paperDes, setPaperDes] = useState(''); // State for paperDes
//   const [message, setMessage] = useState(''); // State for storing the message
//   const [messageType, setMessageType] = useState(''); // State for storing message type (success or error)

//   const toggleDropdown = () => {
//     setShowLawDropdown(!showLawDropdown);
//   };

//   const handleITQuestionsClick = async () => {
//     const token = localStorage.getItem('access_token');
//     const email = localStorage.getItem('email');

//     try {
//       const response = await axios.post('http://127.0.0.1:8000/api/service1/generate-ITmodel-paper/', 
//       {
//         email,
//       }, 
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       setQuestions(response.data.questions);
//       setPaperId(response.data.paperId); // Capture paperId from response
//       setPaperDes(response.data.paperDes); // Capture paperDes from response
//       setShowResults(false);
//       setUserAnswers({});
//       setScore(0);
//       setMessage(''); // Clear any previous message
//     } catch (error) {
//       console.error('Error fetching IT questions:', error);
//       if (error.response && error.response.status === 401) {
//         alert('Session expired. Please log in again.');
//       }
//     }
//   };

//   const normalizeAnswer = (answer) => {
//     return answer.replace(/^[A-D]\.\s*/, '').trim().toLowerCase();
//   };

//   const handleAnswerChange = (questionNumber, answer) => {
//     setUserAnswers((prevAnswers) => ({
//       ...prevAnswers,
//       [questionNumber]: answer,
//     }));
//   };

//   const handleSubmit = async () => {
//     let correctAnswersCount = 0;
//     const questionsPayload = questions.map((question) => {
//       const userAnswer = userAnswers[question.question_number] || '';
//       const normalizedUserAnswer = normalizeAnswer(userAnswer);
//       const normalizedCorrectAnswer = normalizeAnswer(question.correct_answer || '');
//       const answeredCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      
//       if (answeredCorrect) correctAnswersCount++;
      
//       return {
//         question_number: question.question_number,
//         question: question.question,
//         options: question.options,
//         answered_correct: answeredCorrect,
//         user_answer: userAnswer,
//         correct_answer: question.correct_answer,
//       };
//     });

//     const email = localStorage.getItem('email');
//     const payload = {
//       email,
//       paperId,
//       paperDes, // Include paperDes in the payload
//       number_of_questions: questions.length,
//       user_score: correctAnswersCount,
//       questions: questionsPayload,
//     };

//     try {
//       const response = await axios.post('http://127.0.0.1:8000/api/service1/save-response/', payload, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`,
//         },
//       });
//       setScore(correctAnswersCount);
//       setShowResults(true);
//       setMessage(response.data.message || 'Answers submitted successfully!');
//       setMessageType('success'); // Set message type as success
//     } catch (error) {
//       console.error('Error submitting answers:', error);
//       setMessage('Failed to submit answers. Please try again.');
//       setMessageType('error'); // Set message type as error
//     }
//   };

//   return (
//     <div>
//       <h2>Generate Questions</h2>
//       <div className="additional-buttons">
//         <div className="dropdown-container">
//           <button className="additional-button" onClick={toggleDropdown}>
//             Law Questions
//           </button>
//           {showLawDropdown && (
//             <div className="dropdown-content">
//               <ul>
//                 <li>Law Question type 1</li>
//                 <li>Law Question type 2</li>
//                 <li>Law Question type 3</li>
//               </ul>
//             </div>
//           )}
//         </div>
//         <button className="additional-button" onClick={handleITQuestionsClick}>
//           IT Questions
//         </button>
//       </div>

//       {questions.length > 0 && (
//         <div className="quiz-container">
//           <h3>IT Questions</h3>
//           {questions.map((question) => (
//             <div key={question.question_number} className="question-item">
//               <p>{question.question_number}. {question.question}</p>
//               <div className="options">
//                 {question.options.map((option, index) => (
//                   <div key={index} className="option-item">
//                     <input
//                       type="radio"
//                       id={`question-${question.question_number}-option-${index}`}
//                       name={`question-${question.question_number}`}
//                       value={option}
//                       onChange={() => handleAnswerChange(question.question_number, option)}
//                       disabled={showResults}
//                     />
//                     <label htmlFor={`question-${question.question_number}-option-${index}`}>
//                       {option}
//                     </label>
//                   </div>
//                 ))}
//               </div>

//               {showResults && (
//                 <div className="result">
//                   <p>Correct Answer: {question.correct_answer}</p>
//                   {normalizeAnswer(userAnswers[question.question_number]) === normalizeAnswer(question.correct_answer) ? (
//                     <p style={{ color: 'green' }}>You answered correctly!</p>
//                   ) : (
//                     <p style={{ color: 'red' }}>Your answer: {userAnswers[question.question_number]}</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}
//           {!showResults && (
//             <button className="submit-button" onClick={handleSubmit}>
//               Submit Answers
//             </button>
//           )}
//           {showResults && (
//             <div className="score">
//               <h3>Your Score: {score} / {questions.length}</h3>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Display the message */}
//       {message && (
//         <div className={`message ${messageType === 'success' ? 'success' : 'error'}`}>
//           {message}
//         </div>
//       )}
//     </div>
//   );
// }

// export default GenerateQuestions;



import React, { useState } from 'react';
import axios from 'axios';
import LawQuestionsComponent from './LawQuestionsComponent'; // Import the LawQuestionsComponent

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

  const normalizeAnswer = (answer) => answer.replace(/^[A-D]\.\s*/, '').trim().toLowerCase();

  const handleAnswerChange = (questionNumber, answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionNumber]: answer,
    }));
  };

  const handleSubmit = async () => {
    let correctAnswersCount = 0;
    const questionsPayload = questions.map((question) => {
      const userAnswer = userAnswers[question.question_number] || '';
      const normalizedUserAnswer = normalizeAnswer(userAnswer);
      const normalizedCorrectAnswer = normalizeAnswer(question.correct_answer || '');
      const answeredCorrect = normalizedUserAnswer === normalizedCorrectAnswer;

      if (answeredCorrect) correctAnswersCount++;

      return {
        question_number: question.question_number,
        question: question.question,
        options: question.options,
        answered_correct: answeredCorrect,
        user_answer: userAnswer,
        correct_answer: question.correct_answer,
      };
    });

    const email = localStorage.getItem('email');
    const payload = {
      email,
      paperId,
      paperDes,
      number_of_questions: questions.length,
      user_score: correctAnswersCount,
      questions: questionsPayload,
    };

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/service1/save-response/', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      setScore(correctAnswersCount);
      setShowResults(true);
      setMessage(response.data.message || 'Answers submitted successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error submitting answers:', error);
      setMessage('Failed to submit answers. Please try again.');
      setMessageType('error');
    }
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

      {/* Display IT Questions */}
      {isITQuestions && questions.length > 0 && (
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



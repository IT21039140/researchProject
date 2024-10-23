// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import PaperDetails from './PaperDetails'; // Import the PaperDetails component

// function PastGeneratedQuestions() {
//   const [answeredQuestions, setAnsweredQuestions] = useState([]);
//   const [unansweredQuestions, setUnansweredQuestions] = useState([]);
//   const [selectedPaper, setSelectedPaper] = useState(null); // State to store selected paper details

//   useEffect(() => {
//     const fetchQuestions = async () => {
//       try {
//         const token = localStorage.getItem('access_token');
//         const email = localStorage.getItem('email');

//         const response = await axios.post('http://127.0.0.1:8000/api/service1/get-user-questions/', 
//         {
//           email,
//         }, 
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setAnsweredQuestions(response.data.answered);
//         setUnansweredQuestions(response.data.unanswered);
//       } catch (error) {
//         console.error('Error fetching questions:', error);
//       }
//     };

//     fetchQuestions();
//   }, []);

//   const handleViewPaper = async (paperId) => {
//     const email = localStorage.getItem('email');
//     try {
//       const response = await axios.post('http://127.0.0.1:8000/api/service1/get-response/', 
//       {
//         email,
//         paperId,
//       }, 
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('access_token')}`,
//         },
//       });
      
//       setSelectedPaper(response.data); // Set the response data as selected paper
//     } catch (error) {
//       console.error('Error fetching paper details:', error);
//     }
//   };

//   return (
//     <div>
//       <h2>Past Generated Questions</h2>
//       <div className="tables-container">
//         <div className="answered-questions-table">
//           <h3>Answered Questions</h3>
//           {answeredQuestions.length > 0 ? (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Paper ID</th>
//                   <th>Paper Description</th>
//                   <th>Number of Questions</th>
//                   <th>User Score</th>
//                   <th>View Paper</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {answeredQuestions.map((question, index) => (
//                   <tr key={index}>
//                     <td>{question.paperId}</td>
//                     <td>{question.paperDes}</td> {/* Display paperDes */}
//                     <td>{question.number_of_questions}</td>
//                     <td>{question.user_score}</td>
//                     <td>
//                       <button
//                         className="view-paper-button"
//                         onClick={() => handleViewPaper(question.paperId)}
//                       >
//                         <i className="fas fa-eye"></i>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No answered questions available.</p>
//           )}
//         </div>

//         <div className="unanswered-questions-table">
//           <h3>Unanswered Questions</h3>
//           {unansweredQuestions.length > 0 ? (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Paper ID</th>
//                   <th>Paper Description</th>
//                   <th>Number of Questions</th>
//                   <th>View Paper</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {unansweredQuestions.map((question, index) => (
//                   <tr key={index}>
//                     <td>{question.paperId}</td>
//                     <td>{question.paperDes}</td> {/* Display paperDes */}
//                     <td>{question.number_of_questions}</td>
//                     <td>
//                       <button
//                         className="view-paper-button"
//                         onClick={() => handleViewPaper(question.paperId)}
//                       >
//                         <i className="fas fa-eye"></i>
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No unanswered questions available.</p>
//           )}
//         </div>
//       </div>

//       {/* Use the PaperDetails component to display the selected paper */}
//       <PaperDetails selectedPaper={selectedPaper} />
//     </div>
//   );
// }

// export default PastGeneratedQuestions;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaperDetails from './PaperDetails'; // Import the PaperDetails component

function PastGeneratedQuestions() {
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null); // State to store selected paper details
  const [isUnansweredPaper, setIsUnansweredPaper] = useState(false); // State to track if it's an unanswered paper

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const email = localStorage.getItem('email');

        const response = await axios.post('http://127.0.0.1:8000/api/service1/get-user-questions/', 
        {
          email,
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAnsweredQuestions(response.data.answered);
        setUnansweredQuestions(response.data.unanswered);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);

  // Handle the view of answered paper details
  const handleViewPaper = async (paperId) => {
    const email = localStorage.getItem('email');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/service1/get-response/', 
      {
        email,
        paperId,
      }, 
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      setSelectedPaper(response.data); // Set the response data as selected paper
      setIsUnansweredPaper(false); // Set to false as it's an answered paper
    } catch (error) {
      console.error('Error fetching paper details:', error);
    }
  };

  // Handle the view of unanswered paper details
  const handleViewUnansweredPaper = async (paperId) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/service1/get-unanswered-paper/', 
      {
        paperId,
      }, 
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      setSelectedPaper(response.data); // Set the unanswered paper details
      setIsUnansweredPaper(true); // Set to true as it's an unanswered paper
    } catch (error) {
      console.error('Error fetching unanswered paper details:', error);
    }
  };

  return (
    <div>
      <h2>Past Generated Questions</h2>
      <div className="tables-container">
        <div className="answered-questions-table">
          <h3>Answered Questions</h3>
          {answeredQuestions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Paper ID</th>
                  <th>Paper Description</th>
                  <th>Number of Questions</th>
                  <th>User Score</th>
                  <th>View Paper</th>
                </tr>
              </thead>
              <tbody>
                {answeredQuestions.map((question, index) => (
                  <tr key={index}>
                    <td>{question.paperId}</td>
                    <td>{question.paperDes}</td> {/* Display paperDes */}
                    <td>{question.number_of_questions}</td>
                    <td>{question.user_score}</td>
                    <td>
                      <button
                        className="view-paper-button"
                        onClick={() => handleViewPaper(question.paperId)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No answered questions available.</p>
          )}
        </div>

        <div className="unanswered-questions-table">
          <h3>Unanswered Questions</h3>
          {unansweredQuestions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Paper ID</th>
                  <th>Paper Description</th>
                  <th>Number of Questions</th>
                  <th>View Paper</th>
                </tr>
              </thead>
              <tbody>
                {unansweredQuestions.map((question, index) => (
                  <tr key={index}>
                    <td>{question.paperId}</td>
                    <td>{question.paperDes}</td> {/* Display paperDes */}
                    <td>{question.number_of_questions}</td>
                    <td>
                      <button
                        className="view-paper-button"
                        onClick={() => handleViewUnansweredPaper(question.paperId)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No unanswered questions available.</p>
          )}
        </div>
      </div>

      {/* Use the PaperDetails component to display the selected paper */}
      <PaperDetails selectedPaper={selectedPaper} isUnanswered={isUnansweredPaper} />
    </div>
  );
}

export default PastGeneratedQuestions;

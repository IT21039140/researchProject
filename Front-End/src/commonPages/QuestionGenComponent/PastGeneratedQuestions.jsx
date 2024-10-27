import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import PaperDetails from './PaperDetails';
import LawQuestionsComponent from './LawQuestionsComponent';

function PastGeneratedQuestions() {
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [lawPapers, setLawPapers] = useState([]);
  const [selectedQuestionSets, setSelectedQuestionSets] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isUnansweredPaper, setIsUnansweredPaper] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Pagination states for each table
  const [currentAnsweredPage, setCurrentAnsweredPage] = useState(1);
  const [currentUnansweredPage, setCurrentUnansweredPage] = useState(1);
  const [currentLawPage, setCurrentLawPage] = useState(1);
  const recordsPerPage = 5;

  // Calculate records for the current page of each table
  const indexOfLastAnswered = currentAnsweredPage * recordsPerPage;
  const indexOfFirstAnswered = indexOfLastAnswered - recordsPerPage;
  const currentAnsweredQuestions = answeredQuestions.slice(indexOfFirstAnswered, indexOfLastAnswered);

  const indexOfLastUnanswered = currentUnansweredPage * recordsPerPage;
  const indexOfFirstUnanswered = indexOfLastUnanswered - recordsPerPage;
  const currentUnansweredQuestions = unansweredQuestions.slice(indexOfFirstUnanswered, indexOfLastUnanswered);

  const indexOfLastLaw = currentLawPage * recordsPerPage;
  const indexOfFirstLaw = indexOfLastLaw - recordsPerPage;
  const currentLawPapers = lawPapers.slice(indexOfFirstLaw, indexOfLastLaw);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const email = localStorage.getItem('email');
      const response = await axios.post('http://127.0.0.1:8000/api/service1/get-user-questions/', 
      { email }, 
      { headers: { Authorization: `Bearer ${token}` } });

      setAnsweredQuestions(response.data.answered);
      setUnansweredQuestions(response.data.unanswered);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchLawPapers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const email = localStorage.getItem('email');
      const response = await axios.post('http://127.0.0.1:8000/api/service1/retrieve-all-law-papers/', 
      { email },
      { headers: { Authorization: `Bearer ${token}` } });

      setLawPapers(response.data.papers);
    } catch (error) {
      console.error('Error fetching law papers:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchLawPapers();
  }, []);

  const handleViewLawPaper = async (paperId) => {
    try {
      const email = localStorage.getItem('email');
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://127.0.0.1:8000/api/service1/retrieve-a-law-paper/', 
      { email, paperId },
      { headers: { Authorization: `Bearer ${token}` } });

      setSelectedQuestionSets(response.data); // Store retrieved question sets for viewing
      setSelectedPaper(null)
      setMessage('')
    } catch (error) {
      console.error('Error retrieving law paper:', error);
    }
  };

  const handleViewPaper = async (paperId) => {
    const email = localStorage.getItem('email');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/service1/get-response/', 
      { email, paperId }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });

      setSelectedPaper(response.data);
      setIsUnansweredPaper(false);
      setSelectedQuestionSets(null)
      setMessage('')
    } catch (error) {
      console.error('Error fetching paper details:', error);
    }
  };
  const handleViewUnasweredPaper = async (paperId) => {
    const email = localStorage.getItem('email');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/service1/get-unanswered-paper/', 
      { email, paperId }, 
      { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });

      setSelectedPaper(response.data);
      setIsUnansweredPaper(false);
      setSelectedQuestionSets(null)
      setMessage('')
    } catch (error) {
      console.error('Error fetching paper details:', error);
    }
  };


  const handleDeletePaper = async (paperId, type) => {
    const email = localStorage.getItem('email');
    const confirmed = await swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this paper!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });

    if (confirmed) {
      try {
        const endpoint = type === 'law' 
          ? 'http://127.0.0.1:8000/api/service1/law-paper-delete/'
          : 'http://127.0.0.1:8000/api/service1/paper-delete/';

        const response = await axios.delete(endpoint, {
          data: { email, paperId },
          headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });

        setMessage(response.data.message);
        setMessageType('success');

        // Refresh data
        fetchQuestions();
        fetchLawPapers();
      } catch (error) {
        console.error('Error deleting paper:', error);
        setMessage("Failed to delete paper. Please try again.");
        setMessageType('error');
      }
    }
  };

  // Pagination controls for each table
  const totalAnsweredPages = Math.ceil(answeredQuestions.length / recordsPerPage);
  const handleNextAnsweredPage = () => { if (currentAnsweredPage < totalAnsweredPages) setCurrentAnsweredPage((prev) => prev + 1); };
  const handlePreviousAnsweredPage = () => { if (currentAnsweredPage > 1) setCurrentAnsweredPage((prev) => prev - 1); };

  const totalUnansweredPages = Math.ceil(unansweredQuestions.length / recordsPerPage);
  const handleNextUnansweredPage = () => { if (currentUnansweredPage < totalUnansweredPages) setCurrentUnansweredPage((prev) => prev + 1); };
  const handlePreviousUnansweredPage = () => { if (currentUnansweredPage > 1) setCurrentUnansweredPage((prev) => prev - 1); };

  const totalLawPages = Math.ceil(lawPapers.length / recordsPerPage);
  const handleNextLawPage = () => { if (currentLawPage < totalLawPages) setCurrentLawPage((prev) => prev + 1); };
  const handlePreviousLawPage = () => { if (currentLawPage > 1) setCurrentLawPage((prev) => prev - 1); };

  return (
    <div>
      <h2>Past Generated Questions</h2>
      <div className="tables-container">
        {/* Answered Questions Table */}
        <div className="answered-questions-table">
          <h3>Answered Questions</h3>
          {currentAnsweredQuestions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Paper ID</th>
                  <th>Paper Description</th>
                  <th>Number of Questions</th>
                  <th>User Score</th>
                  <th>View Paper</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentAnsweredQuestions.map((question, index) => (
                  <tr key={index}>
                    <td>{question.paperId}</td>
                    <td>{question.paperDes}</td>
                    <td>{question.number_of_questions}</td>
                    <td>{question.user_score}</td>
                    <td><button className="view-paper-button" onClick={() => handleViewPaper(question.paperId)}><i className="fas fa-eye"></i></button></td>
                    <td><button className="delete-paper-button" onClick={() => handleDeletePaper(question.paperId, 'answered')}><i className="fas fa-trash-alt"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No answered questions available.</p>}
          <div className="pagination">
            <button onClick={handlePreviousAnsweredPage} disabled={currentAnsweredPage === 1}>Previous</button>
            <span>Page {currentAnsweredPage} of {totalAnsweredPages}</span>
            <button onClick={handleNextAnsweredPage} disabled={currentAnsweredPage === totalAnsweredPages}>Next</button>
          </div>
        </div>

        {/* Unanswered Questions Table */}
        <div className="unanswered-questions-table">
          <h3>Unanswered Questions</h3>
          {currentUnansweredQuestions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Paper ID</th>
                  <th>Paper Description</th>
                  <th>Number of Questions</th>
                  <th>View Paper</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentUnansweredQuestions.map((question, index) => (
                  <tr key={index}>
                    <td>{question.paperId}</td>
                    <td>{question.paperDes}</td>
                    <td>{question.number_of_questions}</td>
                    <td><button className="view-paper-button" onClick={() => handleViewUnasweredPaper(question.paperId)}><i className="fas fa-eye"></i></button></td>
                    <td><button className="delete-paper-button" onClick={() => handleDeletePaper(question.paperId, 'unanswered')}><i className="fas fa-trash-alt"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No unanswered questions available.</p>}
          <div className="pagination">
            <button onClick={handlePreviousUnansweredPage} disabled={currentUnansweredPage === 1}>Previous</button>
            <span>Page {currentUnansweredPage} of {totalUnansweredPages}</span>
            <button onClick={handleNextUnansweredPage} disabled={currentUnansweredPage === totalUnansweredPages}>Next</button>
          </div>
        </div>

        {/* Law Papers Table */}
        
        <div className="law-papers-table" style={{ marginTop: '20px', textAlign: 'center' }}>
          <h3>Law Papers</h3>
          {currentLawPapers.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Paper ID</th>
                  <th>Paper Description</th>
                  <th>Number of Questions</th>
                  <th>View Paper</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {currentLawPapers.map((paper, index) => (
                  <tr key={index}>
                    <td>{paper.paperId}</td>
                    <td>{paper.paper_description}</td>
                    <td>{paper.number_of_questions}</td>
                    <td>
                      <button
                        className="view-paper-button"
                        onClick={() => handleViewLawPaper(paper.paperId)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                    <td><button className="delete-paper-button" onClick={() => handleDeletePaper(paper.paperId, 'law')}><i className="fas fa-trash-alt"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No law papers available.</p>}
          <div className="pagination">
            <button onClick={handlePreviousLawPage} disabled={currentLawPage === 1}>Previous</button>
            <span>Page {currentLawPage} of {totalLawPages}</span>
            <button onClick={handleNextLawPage} disabled={currentLawPage === totalLawPages}>Next</button>
          </div>
        </div>
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      {selectedPaper && (
        <PaperDetails
          key={selectedPaper.paperId}
          selectedPaper={selectedPaper}
          isUnanswered={isUnansweredPaper}
          fetchQuestions={fetchQuestions}
        />
      )}
      <div style={{marginTop:"20px"}}>
        {selectedQuestionSets && (
          <LawQuestionsComponent questionSets={selectedQuestionSets} />
        )}
      </div>
    </div>
  );
}

export default PastGeneratedQuestions;

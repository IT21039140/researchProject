//Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import QuestionGenerator from '../QuestionGenComponent/QuestionGenerator';
import './Dashboard.css';

function Dashboard({ isQuestionGenerator }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar onCollapse={setSidebarCollapsed} />
      {isQuestionGenerator ? (
        <QuestionGenerator sidebarCollapsed={sidebarCollapsed} />
      ) : (
        <MainContent />
      )}
    </div>
  );
}

export default Dashboard;


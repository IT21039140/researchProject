
//Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import QuestionGenerator from '../QuestionGenComponent/QuestionGenerator';
import './Dashboard.css';
import CareerGuidance from "../../Pages/CareerGuidance/CareerGuidance"

function Dashboard({ isQuestionGenerator,isCareerGuidance }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-container">
      <Sidebar onCollapse={setSidebarCollapsed} />
      {isQuestionGenerator ? (
        <QuestionGenerator sidebarCollapsed={sidebarCollapsed} />
      ): isCareerGuidance?(
        <CareerGuidance />
      ):(
        <MainContent />
      )}
    </div>
  );
}

export default Dashboard;


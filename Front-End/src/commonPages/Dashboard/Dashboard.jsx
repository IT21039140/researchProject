// Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import QuestionGenerator from '../QuestionGenComponent/QuestionGenerator';
import RecommendationDashboard from '../../Pages/UniCourseRecommendationPages/RecommendationDashboard';
import CareerGuidance from "../../Pages/CareerGuidance/CareerGuidance";
import './Dashboard.css';
import CareerGuidance from "../../Pages/CareerGuidance/CareerGuidance"


function Dashboard({ view }) {

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Render the content based on the view prop
  const renderContent = () => {
    switch (view) {
      case 'questionGenerator':
        return <QuestionGenerator sidebarCollapsed={sidebarCollapsed} />;
      case 'recommendationDashboard':
        return <RecommendationDashboard sidebarCollapsed={sidebarCollapsed} />;
      case 'career_guidance':
         return <CareerGuidance sidebarCollapsed={sidebarCollapsed} />;
      default:
        return <MainContent />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onCollapse={setSidebarCollapsed} />
    </div>
  );
}

export default Dashboard;

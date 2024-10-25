// Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import QuestionGenerator from '../QuestionGenComponent/QuestionGenerator';
import RecommendationDashboard from '../../Pages/UniCourseRecommendationPages/RecommendationDashboard';
import './Dashboard.css';

function Dashboard({ view }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Render the content based on the view prop
  const renderContent = () => {
    switch (view) {
      case 'questionGenerator':
        return <QuestionGenerator sidebarCollapsed={sidebarCollapsed} />;
      case 'recommendationDashboard':
        return <RecommendationDashboard sidebarCollapsed={sidebarCollapsed} />;
      default:
        return <MainContent />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar onCollapse={setSidebarCollapsed} />
      {renderContent()}
    </div>
  );
}

export default Dashboard;

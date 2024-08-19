import React, { useState } from 'react';
import Analytics from './QuestionAnalytics';
import PastGeneratedQuestions from './PastGeneratedQuestions';
import GenerateQuestions from './GenerateQuestions';
import './QuestionGenerator.css';

function QuestionGenerator({ sidebarCollapsed }) {
  const [activeTab, setActiveTab] = useState('Analytics');

  const renderContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <Analytics />;
      case 'Past generated Questions':
        return <PastGeneratedQuestions />;
      case 'Generate Questions':
        return <GenerateQuestions />;
      default:
        return null;
    }
  };

  return (
    <div className={`question-generator-container ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'Analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('Analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab ${activeTab === 'Past generated Questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('Past generated Questions')}
        >
          Past generated Questions
        </button>
        <button
          className={`tab ${activeTab === 'Generate Questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('Generate Questions')}
        >
          Generate Questions
        </button>
      </div>
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default QuestionGenerator;
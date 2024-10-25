
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './commonPages/LogIn/Login';
import Dashboard from './commonPages/Dashboard/Dashboard';
import QuestionGenerator from './commonPages/QuestionGenComponent/QuestionGenerator';
import StaticPage from './static/StaticPage';
import SubscriptionPage from './commonPages/LogIn/SubscriptionForm';
import ChatBot from './commonPages/ChatBot/index';
import CareerGuidance from "./Pages/CareerGuidance/CareerGuidance.jsx";
import CourseByStream from "./Pages/UniCourseRecommendationPages/CourseByStream";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={<StaticPage/>}/>
        <Route path="/login" element={<Login />} /> */}
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Dashboard view="mainContent" />} />
        <Route
          path="/question-generator"
          element={<Dashboard view="questionGenerator" />}
        />

        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/chat" element={<ChatBot/>} />
        <Route path="/career_guidance" element={<Dashboard />}>
             <Route index element={<CareerGuidance />} />
        </Route>

        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/chat" element={<ChatBot />} />

        <Route
          path="/recommendation-dashboard"
          element={<Dashboard view="recommendationDashboard" />}
        />
        <Route
          path="/recommendation-dashboard/courses/:stream"
          element={<CourseByStream />}
        />
      </Routes>
    </Router>
  );
}

export default App;

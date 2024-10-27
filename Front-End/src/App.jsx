import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./commonPages/LogIn/Login";
import Dashboard from "./commonPages/Dashboard/Dashboard";

import StaticPage from "./static/StaticPage";
import SubscriptionPage from "./commonPages/LogIn/SubscriptionForm";
import ChatBot from "./commonPages/ChatBot/index";

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

        <Route path="/chat" element={<ChatBot />} />


        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/chat" element={<ChatBot />} />

        <Route
          path="/recommendation-dashboard"
          element={<Dashboard view="recommendationDashboard" />}
        />
        <Route
          path="/career_guidance"
          element={<Dashboard view="career_guidance" />}
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

// src/HomePage.js

import React from "react";
import { Container } from "react-bootstrap";
import UniFeedback from "../../Components/UniCourseRecommendationComponenets/UniFeedback.jsx";
import NavigationBar from "../../Components/Common/NavigationBar.jsx";
import "./Styles/Home.css"; // Import custom CSS file
import RecommendationAbout from "../../Components/UniCourseRecommendationComponenets/RecommendationAbout";
import UniCarousel from "../../Components/UniCourseRecommendationComponenets/UniCarosal.jsx";
import CoursesByStream from "../../Components/UniCourseRecommendationComponenets/CoursesByStream.jsx";
import SupportChat from "../../Components/UniCourseRecommendationComponenets/SupportChat.jsx";
import ChatUI from "../../Components/UniCourseRecommendationComponenets/ChatUI.jsx";
import DragDropForm from "../../Components/UniCourseRecommendationComponenets/DragandDropForm.jsx";
import RankingForm from "../../Components/UniCourseRecommendationComponenets/DragandDropForm.jsx";
 

const RecommendationHome = () => {
  return (
   
    
      <Container fluid className="main-content">
        <UniCarousel />
        <br />
        <br />
        <RecommendationAbout />
        <br />
        <CoursesByStream />
        <br />
        <UniFeedback />
        <ChatUI />
      </Container>
  
  );
};

export default RecommendationHome;

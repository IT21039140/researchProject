import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import RecommendationHome from "./RecommendationHome";
import CourseCatalog from "./CourseCatalog";
import UserProfile from "../../Components/UniCourseRecommendationComponenets/UserProfile";
import "./Styles/RecommendationDashboard.css";

function RecommendationDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const initialTab = query.get("tab") || "RecommendationHome";
  const initialStream = query.get("stream") || "";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [stream, setStream] = useState(initialStream);

  // Effect to update activeTab and stream based on URL parameters
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tabFromURL = query.get("tab") || "RecommendationHome";
    const streamFromURL = query.get("stream") || "";
    
    setActiveTab(tabFromURL);
    setStream(streamFromURL);
  }, [location.search]);

  // Update URL when activeTab or stream changes
  useEffect(() => {
    const newURL = activeTab === "CoursesByStream"
      ? `?tab=${activeTab}&stream=${encodeURIComponent(stream)}`
      : `?tab=${activeTab}`;
    navigate(newURL, { replace: true });
  }, [activeTab, stream, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "RecommendationHome":
        return (
          <RecommendationHome
            goToMyRecommendations={() => setActiveTab("MyRecommendations")}
          />
        );
      case "MyRecommendations":
        return <CourseCatalog />;
      case "CoursesByStream":
        return (
          <iframe
            src={`/recommendation-dashboard/courses/${encodeURIComponent(stream)}`}
            title="Courses By Stream"
            width="100%"
            height="500px"
            style={{ border: "none" }}
          ></iframe>
        );
      case "MyPreferenceProfile":
        return <UserProfile />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-content">
      <div className="tabs-unique">
        <button
          className={`tab-unique ${activeTab === "RecommendationHome" ? "active-unique" : ""}`}
          onClick={() => setActiveTab("RecommendationHome")}
        >
          <i className="fas fa-home"></i> Recommendation Home
        </button>
        <button
          className={`tab-unique ${activeTab === "MyRecommendations" ? "active-unique" : ""}`}
          onClick={() => setActiveTab("MyRecommendations")}
        >
          <i className="fas fa-star"></i> My Recommendations
        </button>
        <button
          className={`tab-unique ${activeTab === "CoursesByStream" ? "active-unique" : ""}`}
          onClick={() => {
            setActiveTab("CoursesByStream");
            setStream("ALL"); // Set a default or dynamically
          }}
        >
          <i className="fas fa-list"></i> Courses by Stream
        </button>
        <button
          className={`tab-unique ${activeTab === "MyPreferenceProfile" ? "active-unique" : ""}`}
          onClick={() => setActiveTab("MyPreferenceProfile")}
        >
          <i className="fas fa-user"></i> My Preference Profile
        </button>
      </div>
      <div className="tab-content-unique">{renderContent()}</div>
    </div>
  );
}

export default RecommendationDashboard;

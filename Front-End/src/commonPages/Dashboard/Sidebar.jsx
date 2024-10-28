import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import profilePic from "../../assets/profilePic2.webp";
import swal from 'sweetalert';
import axios from 'axios';

function Sidebar({ onCollapse }) {
  const [collapsed, setCollapsed] = useState(localStorage.getItem("sidebar-collapsed") === "true");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userDetails = JSON.parse(localStorage.getItem("user_details")) || {};
  const isSubscribed = userDetails.is_subscribed;
  const email = userDetails.email;

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setCollapsed(isMobile);
      onCollapse(isMobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [onCollapse]);

  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    localStorage.setItem("sidebar-collapsed", newCollapsedState);
    onCollapse(newCollapsedState);
  };

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const handleOutsideClick = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !profileRef.current.contains(e.target)) {
      setDropdownVisible(false);
    }
  };

  useEffect(() => {
    if (dropdownVisible) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [dropdownVisible]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_details");
    navigate("/");
  };

  const handleQuestionGeneratorClick = () => {
    if (isSubscribed) {
      navigate("/question-generator");
    } else {
      swal("Subscription Required", "You need to subscribe to access this service. \n Click sttings and subscribe", "warning");
    }
  };

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let captcha = '';
    for (let i = 0; i < 8; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  };

  const handleSubscriptionClick = () => {
    if (isSubscribed) {
      const captchaText = generateCaptcha();
      swal({
        title: "Cancel Subscription",
        text: `To confirm, please type "${captchaText}" exactly as shown.`,
        content: "input",
        buttons: true,
        dangerMode: true,
      }).then(async (inputText) => {
        if (inputText === captchaText) {
          try {
            const response = await axios.post(
              'http://127.0.0.1:8000/api/subscription/cancel/',
              { email },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                  "Content-Type": "application/json",
                },
              }
            );

            swal("Subscription Canceled", response.data.message || "Your subscription has been successfully canceled.", "success");
            
            // Update user details in localStorage
            const updatedUserDetails = { ...userDetails, is_subscribed: false, stripe_customer_id: null };
            localStorage.setItem("user_details", JSON.stringify(updatedUserDetails));

            navigate("/dashboard");
          } catch (error) {
            swal("Error", "Failed to cancel subscription. Please try again later.", "error");
          }
        } else if (inputText !== null) {
          swal("Incorrect Text", "The text you entered does not match. Please try again.", "error");
        }
      });
    } else {
      navigate("/subscribe");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`dashboard-sidebar ${collapsed ? "collapsed" : ""}`} id="sidebar">
      <div className="sidebar-header">
        <h2 className="app-logo">Aspira</h2>
        <button id="sidebar-toggle-btn" onClick={toggleSidebar}>
          &#9776;
        </button>
      </div>
      <nav className="sidebar-navigation">
        <img src="/src/assets/logInImage.png" alt="Logo Icon" className="logo-image" />
        <ul className="nav-list">
          <li>
            <a className={`nav-link ${isActive("/dashboard") ? "active" : ""}`} onClick={() => navigate("/dashboard")}>
              Dashboard
            </a>
          </li>
          <li>
            <a href="/recommendation-dashboard?tab=RecommendationHome" className={`nav-link ${isActive("/recommendation-dashboard") ? "active" : ""}`}>
              UniCourseNavigator
            </a>
          </li>
          <li>
            <a href="/career_guidance" className={`nav-link ${isActive("/career_guidance") ? "active" : ""}`}>
              Career Guidance
            </a>
          </li>
          <li>
            <a href="/chat" className="nav-link">EduGuideBot</a>
          </li>
          <li>
            <a className={`nav-link ${isActive("/question-generator") ? "active" : ""}`} onClick={handleQuestionGeneratorClick}>
              Question Generator
            </a>
          </li>
          {/* User Profile Dropdown added after Question Generator */}
          <li className="sidebar-profile" ref={profileRef} onClick={toggleDropdown}>
            <img src={profilePic} alt="Profile Icon" className="profile-icon" />
            <a href="#" className="profile-name">Settings</a>
            {dropdownVisible && (
              <div ref={dropdownRef} className={`profile-dropdown ${collapsed ? "collapsed-menu" : ""}`}>
                <ul>
                  <li>
                    <a onClick={handleSubscriptionClick}>
                      {isSubscribed ? "Cancel Subscription" : "Subscribe"}
                    </a>
                  </li>
                  <li>
                    <a onClick={handleLogout}>Log Out</a>
                  </li>
                </ul>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

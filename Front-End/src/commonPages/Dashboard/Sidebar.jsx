// Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import profilePic from "../../assets/profilePic2.webp";

function Sidebar({ onCollapse }) {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem("sidebar-collapsed") === "true"
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      setCollapsed(isMobile);
      onCollapse(isMobile);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check initial size

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
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target) &&
      !profileRef.current.contains(e.target)
    ) {
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
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`dashboard-sidebar ${collapsed ? "collapsed" : ""}`}
      id="sidebar"
    >
      <div className="sidebar-header">
        <h2 className="app-logo">Aspira</h2>
        <button id="sidebar-toggle-btn" onClick={toggleSidebar}>
          &#9776;
        </button>
      </div>
      <nav className="sidebar-navigation">
        <img
          src="/src/assets/logInImage.png"
          alt="Logo Icon"
          className="logo-image"
        />
        <ul className="nav-list">
          <li>
            <a
              className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/recommendation-dashboard?tab=RecommendationHome"
              className={`nav-link ${isActive("/recommendation-dashboard") ? "active" : ""}`}
            >
              UniCourseNavigator
            </a>
          </li>
          <li>
            <a
              href="/career_guidance"
              className={`nav-link ${isActive("/career_guidance") ? "active" : ""}`}
            >
              Career Guidance
            </a>
          </li>
          <li>
            <a href="#" className="nav-link">Option 3</a>
          </li>
          <li>
            <a href="/chat" className="nav-link">EduGuideBot</a>
          </li>
          <li>
            <a
              className={`nav-link ${isActive("/question-generator") ? "active" : ""}`}
              onClick={() => navigate("/question-generator")}
            >
              Question Generator
            </a>
          </li>
        </ul>
      </nav>

      <div className="user-profile" ref={profileRef} onClick={toggleDropdown}>
        <img src={profilePic} alt="Profile Icon" className="profile-image" />
        <a href="#" className="profile-name">My Profile</a>
        {dropdownVisible && (
          <div ref={dropdownRef} className={`dropdown-menu ${collapsed ? "collapsed-menu" : ""}`}>
            <ul>
              <li>
                <a onClick={() => navigate("/settings")}>Settings</a>
              </li>
              <li>
                <a onClick={handleLogout}>Log Out</a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;

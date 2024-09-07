import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-container">
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;

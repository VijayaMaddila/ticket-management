import React from "react";
import "./ui.css";

/**
 * Shared dashboard wrapper: .dashboard-wrapper > .main-content > .dashboard-content
 */
const DashboardLayout = ({ title, children, className = "" }) => (
  <div className="dashboard-wrapper">
    <div className="main-content">
      <main className={`dashboard-content ${className}`.trim()}>
        {title && <h2 className="dashboard-title">{title}</h2>}
        {children}
      </main>
    </div>
  </div>
);

export default DashboardLayout;

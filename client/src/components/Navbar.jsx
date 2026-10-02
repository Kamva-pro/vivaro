import React from "react";
import { VivaroLogo } from "./Icons";

const Navbar = ({ loading, error, onNavigateSection }) => {
  return (
    <header className="site-navbar">
      <div className="navbar-container">
        {/* Brand Identification */}
        <div className="navbar-brand" onClick={() => onNavigateSection("top")}>
          <VivaroLogo size={36} className="brand-logo-mark" />
          <div className="brand-text-group">
            <span className="brand-name">VIVARO</span>
            <span className="brand-sub">Spatial Infrastructure Intelligence</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-nav">
          <button
            className="nav-link"
            onClick={() => onNavigateSection("overview")}
          >
            Overview
          </button>
          <button
            className="nav-link"
            onClick={() => onNavigateSection("communities")}
          >
            Directory
          </button>
          <button
            className="nav-link"
            onClick={() => onNavigateSection("methodology")}
          >
            Methodology
          </button>
        </nav>

        {/* Right Status Indicator */}
        <div className="navbar-actions">
          <div className={`system-status-indicator ${error ? "status-offline" : loading ? "status-syncing" : "status-online"}`}>
            <span className="status-ping"></span>
            <span className="status-text">
              {error ? "API Notice" : loading ? "Syncing Dataset..." : "Cloud API Live"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

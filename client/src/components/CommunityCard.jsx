import React from "react";

const CommunityCard = ({ community, onSelect }) => {
  const hasSchoolDeficit = community.school_dist > 10;
  const hasClinicDeficit = community.healthcare_dist > 10;
  const isCritical = hasSchoolDeficit && hasClinicDeficit;

  const lat = community.coords ? community.coords[0].toFixed(3) : 0;
  const lon = community.coords ? community.coords[1].toFixed(3) : 0;

  return (
    <div
      className={`community-card ${isCritical ? "card-critical" : ""}`}
      onClick={() => onSelect(community)}
    >
      <div className="card-top">
        <div className="card-title-group">
          <h3 className="card-title">{community.name}</h3>
          <span className="card-coords">
            {lat}°S, {lon}°E
          </span>
        </div>
        <div className="card-badge-container">
          {isCritical ? (
            <span className="badge badge-critical">🚨 Critical Deficit</span>
          ) : hasSchoolDeficit ? (
            <span className="badge badge-warning">🏫 School Deficit</span>
          ) : (
            <span className="badge badge-info">🏥 Clinic Deficit</span>
          )}
        </div>
      </div>

      <div className="card-stats-grid">
        <div className={`card-stat ${hasSchoolDeficit ? "stat-alert" : ""}`}>
          <span className="stat-label">🏫 Nearest School</span>
          <span className="stat-value">{community.school_dist} km</span>
        </div>
        <div className={`card-stat ${hasClinicDeficit ? "stat-alert" : ""}`}>
          <span className="stat-label">🏥 Nearest Clinic</span>
          <span className="stat-value">{community.healthcare_dist} km</span>
        </div>
      </div>

      {community.recommendations && (
        <div className="card-rec-preview">
          <span className="rec-sparkle">✨ AI Proposal:</span>
          <span className="rec-text">
            {community.recommendations.newSchool && community.recommendations.newClinic
              ? "New School & Clinic Hub"
              : community.recommendations.newSchool
              ? "New School Recommended"
              : "New Clinic Recommended"}
          </span>
        </div>
      )}

      <div className="card-action">
        <button
          className="inspect-btn"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(community);
          }}
        >
          <span>Inspect Street View</span>
          <span className="arrow">➔</span>
        </button>
      </div>
    </div>
  );
};

export default CommunityCard;

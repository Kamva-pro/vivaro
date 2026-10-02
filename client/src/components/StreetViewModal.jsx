import React, { useState } from "react";

const StreetViewModal = ({ community, onClose }) => {
  const [viewMode, setViewMode] = useState("street"); // 'street' or 'satellite'

  if (!community) return null;

  const lat = community.coords ? community.coords[0] : 0;
  const lon = community.coords ? community.coords[1] : 0;

  // Google Street View embed using lat,lon coordinates
  const streetViewUrl = `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lon}&cbp=11,0,0,0,0&output=svembed`;
  
  // Google Satellite / Map embed
  const satelliteUrl = `https://maps.google.com/maps?q=${lat},${lon}&t=k&z=15&output=embed`;

  const externalMapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  const rec = community.recommendations;
  const hasSchoolDeficit = community.school_dist > 10;
  const hasClinicDeficit = community.healthcare_dist > 10;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div className="modal-badges">
              <span className="badge badge-accent">🇿🇦 South Africa</span>
              {hasSchoolDeficit && hasClinicDeficit && (
                <span className="badge badge-critical">🚨 Critical Deficit</span>
              )}
              {hasSchoolDeficit && !hasClinicDeficit && (
                <span className="badge badge-warning">🏫 School Deficit</span>
              )}
              {!hasSchoolDeficit && hasClinicDeficit && (
                <span className="badge badge-info">🏥 Clinic Deficit</span>
              )}
            </div>
            <h2 className="modal-title">{community.name}</h2>
            <p className="modal-coords">
              Coordinates: {lat.toFixed(4)}° S, {lon.toFixed(4)}° E
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-grid">
          {/* Left Column: Visual Street View / Satellite View */}
          <div className="view-container">
            <div className="view-toggle-bar">
              <div className="view-mode-buttons">
                <button
                  className={`toggle-btn ${viewMode === "street" ? "active" : ""}`}
                  onClick={() => setViewMode("street")}
                >
                  🚶 360° Street View
                </button>
                <button
                  className={`toggle-btn ${viewMode === "satellite" ? "active" : ""}`}
                  onClick={() => setViewMode("satellite")}
                >
                  🛰️ Satellite Imagery
                </button>
              </div>
              <a
                href={externalMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="external-map-link"
              >
                Open in Google Maps ↗
              </a>
            </div>

            <div className="iframe-wrapper">
              <iframe
                title={`Inspection view of ${community.name}`}
                src={viewMode === "street" ? streetViewUrl : satelliteUrl}
                className="street-view-iframe"
                loading="lazy"
                allowFullScreen
              />
            </div>
            <div className="view-footnote">
              {viewMode === "street"
                ? "Showing street-level panorama. Note: In remote areas without direct Street View coverage, switch to Satellite view."
                : "Showing high-resolution aerial satellite imagery of the community and surrounding terrain."}
            </div>
          </div>

          {/* Right Column: Deficit Analysis & AI Recommendations */}
          <div className="analysis-panel">
            <h3 className="section-heading">Facility Access Metrics</h3>
            <div className="metric-cards-grid">
              <div className={`metric-card ${hasSchoolDeficit ? "deficit-card" : "normal-card"}`}>
                <div className="metric-header">
                  <span className="metric-icon">🏫</span>
                  <span className="metric-label">Nearest School</span>
                </div>
                <div className="metric-value">{community.school_dist} km</div>
                <div className="metric-status">
                  {hasSchoolDeficit
                    ? `⚠️ ${(community.school_dist - 10).toFixed(1)} km beyond acceptable threshold (10 km)`
                    : "✅ Within acceptable distance"}
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill school-fill"
                    style={{
                      width: `${Math.min(100, (community.school_dist / 30) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className={`metric-card ${hasClinicDeficit ? "deficit-card" : "normal-card"}`}>
                <div className="metric-header">
                  <span className="metric-icon">🏥</span>
                  <span className="metric-label">Nearest Healthcare</span>
                </div>
                <div className="metric-value">{community.healthcare_dist} km</div>
                <div className="metric-status">
                  {hasClinicDeficit
                    ? `⚠️ ${(community.healthcare_dist - 10).toFixed(1)} km beyond acceptable threshold (10 km)`
                    : "✅ Within acceptable distance"}
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-bar-fill clinic-fill"
                    style={{
                      width: `${Math.min(100, (community.healthcare_dist / 30) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* AI Recommendation Section */}
            <div className="ai-recommendation-box">
              <div className="ai-box-header">
                <span className="ai-sparkle">✨</span>
                <span className="ai-box-title">AI Resource Allocation Plan</span>
              </div>

              {rec ? (
                <div className="ai-details">
                  {rec.newSchool && (
                    <div className="rec-item">
                      <div className="rec-type">📍 Proposed School Location</div>
                      <div className="rec-coords">{rec.newSchool}</div>
                    </div>
                  )}

                  {rec.newClinic && (
                    <div className="rec-item">
                      <div className="rec-type">📍 Proposed Clinic Location</div>
                      <div className="rec-coords">{rec.newClinic}</div>
                    </div>
                  )}

                  {rec.justification && (
                    <div className="rec-justification">
                      <strong>Strategic Justification:</strong>
                      <p>{rec.justification}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-rec-text">
                  This community metrics are currently balanced or awaiting cluster optimization.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreetViewModal;

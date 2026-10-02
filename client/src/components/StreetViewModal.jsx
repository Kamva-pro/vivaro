import React, { useState } from "react";
import {
  IconSchool,
  IconHospital,
  IconAlert,
  IconStreetView,
  IconSatellite,
  IconExternalLink,
  IconClose,
  IconTarget,
} from "./Icons";

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
              <span className="badge badge-accent">South Africa</span>
              {hasSchoolDeficit && hasClinicDeficit && (
                <span className="badge badge-critical">
                  <IconAlert size={12} className="badge-icon" />
                  Critical Deficit
                </span>
              )}
              {hasSchoolDeficit && !hasClinicDeficit && (
                <span className="badge badge-warning">
                  <IconSchool size={12} className="badge-icon" />
                  School Deficit
                </span>
              )}
              {!hasSchoolDeficit && hasClinicDeficit && (
                <span className="badge badge-info">
                  <IconHospital size={12} className="badge-icon" />
                  Clinic Deficit
                </span>
              )}
            </div>
            <h2 className="modal-title">{community.name}</h2>
            <p className="modal-coords">
              Coordinates: {lat.toFixed(4)}° S, {lon.toFixed(4)}° E
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <IconClose size={18} />
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
                  <IconStreetView size={14} className="btn-icon" />
                  <span>360° Street View</span>
                </button>
                <button
                  className={`toggle-btn ${viewMode === "satellite" ? "active" : ""}`}
                  onClick={() => setViewMode("satellite")}
                >
                  <IconSatellite size={14} className="btn-icon" />
                  <span>Satellite Aerial</span>
                </button>
              </div>
              <a
                href={externalMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="external-map-link"
              >
                <span>Google Maps</span>
                <IconExternalLink size={12} />
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
                ? "Showing street-level panorama. In rural communities without street camera coverage, toggle Satellite view for high-altitude inspection."
                : "Showing high-resolution aerial satellite imagery of the community settlement pattern and road network."}
            </div>
          </div>

          {/* Right Column: Deficit Analysis & AI Recommendations */}
          <div className="analysis-panel">
            <h3 className="section-heading">Facility Access Metrics</h3>
            <div className="metric-cards-grid">
              <div className={`metric-card ${hasSchoolDeficit ? "deficit-card" : "normal-card"}`}>
                <div className="metric-header">
                  <IconSchool size={16} className="metric-icon school-icon" />
                  <span className="metric-label">Nearest School</span>
                </div>
                <div className="metric-value">{community.school_dist} km</div>
                <div className="metric-status">
                  {hasSchoolDeficit
                    ? `Warning: ${(community.school_dist - 10).toFixed(1)} km beyond acceptable policy threshold (10 km)`
                    : "Within acceptable access radius"}
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
                  <IconHospital size={16} className="metric-icon clinic-icon" />
                  <span className="metric-label">Nearest Healthcare Facility</span>
                </div>
                <div className="metric-value">{community.healthcare_dist} km</div>
                <div className="metric-status">
                  {hasClinicDeficit
                    ? `Warning: ${(community.healthcare_dist - 10).toFixed(1)} km beyond acceptable policy threshold (10 km)`
                    : "Within acceptable access radius"}
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
                <IconTarget size={16} className="ai-icon" />
                <span className="ai-box-title">Resource Allocation Proposal</span>
              </div>

              {rec ? (
                <div className="ai-details">
                  {rec.newSchool && (
                    <div className="rec-item">
                      <div className="rec-type">
                        <IconSchool size={13} className="rec-type-icon" />
                        Proposed Educational Hub Coordinates
                      </div>
                      <div className="rec-coords">{rec.newSchool}</div>
                    </div>
                  )}

                  {rec.newClinic && (
                    <div className="rec-item">
                      <div className="rec-type">
                        <IconHospital size={13} className="rec-type-icon" />
                        Proposed Primary Health Clinic Coordinates
                      </div>
                      <div className="rec-coords">{rec.newClinic}</div>
                    </div>
                  )}

                  {rec.justification && (
                    <div className="rec-justification">
                      <strong>Policy Justification:</strong>
                      <p>{rec.justification}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="no-rec-text">
                  This community currently meets core spatial criteria or is under review.
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

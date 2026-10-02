import React, { useState } from "react";
import {
  IconSchool,
  IconHospital,
  IconAlert,
  IconStreetView,
  IconSatellite,
  IconClose,
  IconTarget,
  IconPin,
} from "./Icons";

const parseCoords = (coordsInput) => {
  if (!coordsInput) return null;
  if (Array.isArray(coordsInput) && coordsInput.length >= 2) {
    return { lat: Number(coordsInput[0]), lon: Number(coordsInput[1]) };
  }
  if (typeof coordsInput === "string") {
    const parts = coordsInput.split(",").map((p) => Number(p.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lon: parts[1] };
    }
  }
  return null;
};

const StreetViewModal = ({ community, onClose }) => {
  if (!community) return null;

  const communityCoords = parseCoords(community.coords) || { lat: -30.5595, lon: 22.9375 };
  const rec = community.recommendations;
  const schoolCoords = rec && rec.newSchool ? parseCoords(rec.newSchool) : null;
  const clinicCoords = rec && rec.newClinic ? parseCoords(rec.newClinic) : null;

  // Active target being inspected: 'community', 'school', or 'clinic'
  const [activeTarget, setActiveTarget] = useState(
    schoolCoords ? "school" : clinicCoords ? "clinic" : "community"
  );
  // View layer: 'hybrid' (satellite + roads), 'satellite' (pure aerial), 'roadmap'
  const [mapType, setMapType] = useState("h"); // 'h' = hybrid, 'k' = satellite, 'm' = roadmap

  // Determine active coordinates to display
  let currentCoords = communityCoords;
  let targetLabel = "Existing Community Settlement";
  let targetDescription = "Ground terrain and settlement layout of the current populated area.";

  if (activeTarget === "school" && schoolCoords) {
    currentCoords = schoolCoords;
    targetLabel = "Proposed School Placement Site";
    targetDescription = "Geographic cluster centroid selected by AI optimization to maximize access for surrounding learners.";
  } else if (activeTarget === "clinic" && clinicCoords) {
    currentCoords = clinicCoords;
    targetLabel = "Proposed Primary Healthcare Site";
    targetDescription = "Strategic position selected to minimize emergency travel distance for underserved households.";
  }

  // Google Maps Hybrid Embed (Never blocked by X-Frame-Options, works everywhere in SA)
  const embedUrl = `https://maps.google.com/maps?q=${currentCoords.lat},${currentCoords.lon}&t=${mapType}&z=16&ie=UTF8&iwloc=&output=embed`;

  const hasSchoolDeficit = community.school_dist > 10;
  const hasClinicDeficit = community.healthcare_dist > 10;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
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
              Inspecting: {targetLabel} ({currentCoords.lat.toFixed(4)}° S, {currentCoords.lon.toFixed(4)}° E)
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <IconClose size={18} />
          </button>
        </div>

        {/* Target Site Selector Tabs */}
        <div className="target-selector-bar">
          <span className="target-selector-label">Inspect Location:</span>
          <div className="target-buttons">
            <button
              className={`target-btn ${activeTarget === "community" ? "active" : ""}`}
              onClick={() => setActiveTarget("community")}
            >
              <IconPin size={13} />
              <span>Current Settlement</span>
            </button>

            {schoolCoords && (
              <button
                className={`target-btn target-school ${activeTarget === "school" ? "active" : ""}`}
                onClick={() => setActiveTarget("school")}
              >
                <IconSchool size={13} />
                <span>Proposed School Site</span>
              </button>
            )}

            {clinicCoords && (
              <button
                className={`target-btn target-clinic ${activeTarget === "clinic" ? "active" : ""}`}
                onClick={() => setActiveTarget("clinic")}
              >
                <IconHospital size={13} />
                <span>Proposed Clinic Site</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body-grid">
          {/* Left Column: Visual Map / Satellite / Street View */}
          <div className="view-container">
            <div className="view-toggle-bar">
              <div className="view-mode-buttons">
                <button
                  className={`toggle-btn ${mapType === "h" ? "active" : ""}`}
                  onClick={() => setMapType("h")}
                  title="Satellite terrain with road labels"
                >
                  <IconSatellite size={13} />
                  <span>Hybrid Satellite</span>
                </button>
                <button
                  className={`toggle-btn ${mapType === "m" ? "active" : ""}`}
                  onClick={() => setMapType("m")}
                  title="Standard road layout"
                >
                  <IconStreetView size={13} />
                  <span>Street Roads</span>
                </button>
              </div>
            </div>

            {/* Embedded Interactive Viewer */}
            <div className="iframe-wrapper">
              <iframe
                key={`${currentCoords.lat}-${currentCoords.lon}-${mapType}`}
                title={`Inspection view of ${community.name}`}
                src={embedUrl}
                className="street-view-iframe"
                loading="lazy"
                allowFullScreen
              />
            </div>

            <div className="view-footnote">
              <strong>{targetLabel}:</strong> {targetDescription}
              <br />
              <span className="footnote-sub">
                Interactive zoom, pan, and road inspections are hosted directly inside this viewer.
              </span>
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
                    ? `Warning: ${(community.school_dist - 10).toFixed(1)} km beyond 10 km threshold`
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
                    ? `Warning: ${(community.healthcare_dist - 10).toFixed(1)} km beyond 10 km threshold`
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
                    <div
                      className={`rec-item ${activeTarget === "school" ? "rec-item-highlight" : ""}`}
                      onClick={() => setActiveTarget("school")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="rec-type">
                        <IconSchool size={13} className="rec-type-icon" />
                        <span>Proposed Educational Hub Site</span>
                        <span className="rec-hint-badge">Click to view site</span>
                      </div>
                      <div className="rec-coords">{rec.newSchool}</div>
                    </div>
                  )}

                  {rec.newClinic && (
                    <div
                      className={`rec-item ${activeTarget === "clinic" ? "rec-item-highlight" : ""}`}
                      onClick={() => setActiveTarget("clinic")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="rec-type">
                        <IconHospital size={13} className="rec-type-icon" />
                        <span>Proposed Healthcare Clinic Site</span>
                        <span className="rec-hint-badge">Click to view site</span>
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

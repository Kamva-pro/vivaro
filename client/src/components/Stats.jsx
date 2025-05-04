import React from "react";

const Stats = ({ statsData, selectedCommunity }) => {
  if (selectedCommunity) {
    return (
      <div id="community-details">
        <h2>{selectedCommunity.name} - Detailed Analysis</h2>
        <p>
          <strong>School Distance:</strong> {selectedCommunity.school_dist} km
        </p>
        <p>
          <strong>Healthcare Distance:</strong> {selectedCommunity.healthcare_dist} km
        </p>
        <p>
          <strong>Underserved Status:</strong> {selectedCommunity.underserved ? "🚨 Yes" : "✅ No"}
        </p>
      </div>
    );
  }

  return (
    <div id="stats">
      <h2>Underserved Community Stats</h2>
      <p>
        <strong>Total Cities:</strong> <span id="totalCities">{statsData.totalCities}</span>
      </p>
      <p>
        <strong>Underserved Cities:</strong> <span id="underservedCount">{statsData.underservedCount}</span>
      </p>
      <p>
        <strong>Schools Underserved:</strong> <span id="schoolUnderserved">{statsData.schoolUnderserved}</span>
      </p>
      <p>
        <strong>Healthcare Underserved:</strong> <span id="healthcareUnderserved">{statsData.healthcareUnderserved}</span>
      </p>
    </div>
  );
};

export default Stats;

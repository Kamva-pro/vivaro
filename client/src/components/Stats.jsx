import React from "react";

const Stats = ({ statsData, selectedCommunity }) => {
  if (selectedCommunity) {
    // Dynamically compute underserved status:
    // Mark as underserved if the API flag is set or if either distance exceeds 10 km.
    const isUnderserved =
      selectedCommunity.underserved ||
      selectedCommunity.school_dist > 10 ||
      selectedCommunity.healthcare_dist > 10;

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
          <strong>Underserved Status:</strong>{" "}
          {isUnderserved ? "🚨 Yes" : "✅ No"}
        </p>
        {isUnderserved && selectedCommunity.recommendations && (
          <>
            <p>
              <strong>New School Recommendation:</strong>{" "}
              {selectedCommunity.recommendations.newSchool}
            </p>
            <p>
              <strong>New Clinic Recommendation:</strong>{" "}
              {selectedCommunity.recommendations.newClinic}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div id="stats">
      <h2>Underserved Community Stats</h2>
      <p>
        <strong>Total Cities:</strong>{" "}
        <span id="totalCities">{statsData.totalCities}</span>
      </p>
      <p>
        <strong>Underserved Cities:</strong>{" "}
        <span id="underservedCount">{statsData.underservedCount}</span>
      </p>
      <p>
        <strong>Schools Underserved:</strong>{" "}
        <span id="schoolUnderserved">{statsData.schoolUnderserved}</span>
      </p>
      <p>
        <strong>Healthcare Underserved:</strong>{" "}
        <span id="healthcareUnderserved">{statsData.healthcareUnderserved}</span>
      </p>
    </div>
  );
};

export default Stats;

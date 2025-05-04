import React from "react";

const Stats = ({ statsData, selectedCommunity }) => {
  if (selectedCommunity) {
    const isUnderserved =
      selectedCommunity.underserved ||
      selectedCommunity.school_dist > 10 ||
      selectedCommunity.healthcare_dist > 10;

    return (
      <div id="community-details">
        <h2>{selectedCommunity.name} - Detailed Analysis</h2>
        <p>
          <strong>Nearest School:</strong> {selectedCommunity.school_dist} km
        </p>
        <p>
          <strong>Nearest Healthcare Facility:</strong> {selectedCommunity.healthcare_dist} km
        </p>
        <p>
          <strong>Underserved Status:</strong>{" "}
          {isUnderserved ? "🚨 Yes" : "✅ No"}
        </p>
        {isUnderserved && selectedCommunity.recommendations && (
          <>
            {selectedCommunity.recommendations.newSchool ? (
              <p>
                <strong>New School Recommendation:</strong>{" "}
                {selectedCommunity.recommendations.newSchool}
              </p>
            ) : null}
            {selectedCommunity.recommendations.newClinic ? (
              <p>
                <strong>New Clinic Recommendation:</strong>{" "}
                {selectedCommunity.recommendations.newClinic}
              </p>
            ) : null}
            {selectedCommunity.recommendations.justification && (
              <p>
                <em>{selectedCommunity.recommendations.justification}</em>
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div id="stats">
      <h2>Underserved Community Stats</h2>
      <p>
        <strong>Total Communities Found:</strong>{" "}
        <span id="totalCities">{statsData.totalCities}</span>
      </p>
      <p>
        <strong>Underserved Communities:</strong>{" "}
        <span id="underservedCount">{statsData.underservedCount}</span>
      </p>
      <p>
        <strong>Lack of Schools:</strong>{" "}
        <span id="schoolUnderserved">{statsData.schoolUnderserved}</span>
      </p>
      <p>
        <strong>Lack of Healthcare Facilities:</strong>{" "}
        <span id="healthcareUnderserved">{statsData.healthcareUnderserved}</span>
      </p>
    </div>
  );
};

export default Stats;

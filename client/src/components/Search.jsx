import React, { useState } from "react";

const Search = ({ onSearchResult, onReset }) => {
  const [cityName, setCityName] = useState("");

  const handleSearch = () => {
    if (!cityName.trim()) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data || data.length === 0) {
          alert("City not found.");
          return;
        }
        const cityCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        const newZoom = 10;

        fetch(`http://127.0.0.1:8000/analyze?lat=${cityCoords[0]}&lon=${cityCoords[1]}`)
          .then((response) => response.json())
          .then((analysisData) => {
            const communityDetails = {
              name: cityName,
              school_dist: analysisData.nearest_school_dist,
              healthcare_dist: analysisData.nearest_healthcare_dist,
              underserved: analysisData.underserved,
            };
            onSearchResult(cityCoords, communityDetails, newZoom);
          })
          .catch((error) => console.error("Error analyzing city:", error));
      })
      .catch((error) => console.error("Error searching city:", error));
  };

  return (
    <div id="searchBar" style={{ padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
      <input
        type="text"
        id="searchBox"
        placeholder="Enter a city name"
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
      />
      <button onClick={handleSearch}>Search City</button>
      <button onClick={onReset}>Reset Map</button>
    </div>
  );
};

export default Search;

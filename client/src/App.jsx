import React, { useState, useEffect } from "react";
import Map from "./components/Map";
import Stats from "./components/Stats";
import Search from "./components/Search";
import ChatComponent from "./components/ChatComponent";
import { fetchUnderservedData } from "./fetchdata";

const App = () => {
  const [mapCenter, setMapCenter] = useState([-30.5595, 22.9375]); // South Africa center
  const [zoomLevel, setZoomLevel] = useState(6);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchUnderservedData()
      .then((fetchedData) => setData(fetchedData))
      .catch((error) => console.error("Error loading data:", error));
  }, []);

  const underservedData = (data && data.underserved) || [];
  const statsData = data
    ? {
        totalCities: data.total_cities || 0,
        underservedCount: underservedData.length,
        schoolUnderserved:
          underservedData.filter((c) => c.school_dist > 10).length || 0,
        healthcareUnderserved:
          underservedData.filter((c) => c.healthcare_dist > 10).length || 0,
      }
    : {};

  return (
    <div className="app">
      {/* Left Column: Map and its overlays */}
      <div className="left-column">
        <div className="map-container">
          <Map
            mapCenter={mapCenter}
            zoomLevel={zoomLevel}
            underservedData={underservedData}
            onCommunitySelect={setSelectedCommunity}
          />
          {/* Loading banner at the bottom-centered of the map container */}
          {!data && (
            <div className="loading-banner">
              <div className="spinner"></div>
              <div className="loading-text">Analyzing Data...</div>
            </div>
          )}
          {/* Stats overlay positioned in the bottom-left of the map */}
          {data && (
            <div className="stats-overlay">
              <Stats statsData={statsData} selectedCommunity={selectedCommunity} />
            </div>
          )}
          {/* Search container overlaid on the map */}
          <div className="search-container">
            <Search
              onSearchResult={(newCenter, communityDetails, newZoom) => {
                setMapCenter(newCenter);
                setSelectedCommunity(communityDetails);
                setZoomLevel(newZoom);
              }}
              onReset={() => {
                setMapCenter([-30.5595, 22.9375]);
                setSelectedCommunity(null);
                setZoomLevel(6);
              }}
            />
          </div>
        </div>
      </div>

      {/* Right Column: Chat component (or any other component) */}
      <div className="right-column">
        <ChatComponent />
      </div>
    </div>
  );
};

export default App;

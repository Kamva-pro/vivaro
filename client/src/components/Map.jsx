import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Flat, minimal marker icon (resembling Google Maps’ flat design)
// Removed shadowUrl to maintain a flat appearance and adjusted sizes to be smaller.
const pinIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
  iconSize: [20, 34],       // Smaller icon size
  iconAnchor: [10, 34],
  popupAnchor: [1, -28],
  shadowUrl: null,         // Disable the shadow for a flat look
});

// Component to smoothly animate the map view changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.25,
    });
  }, [center, zoom, map]);
  return null;
};

const Map = ({ mapCenter, zoomLevel = 14, underservedData, onCommunitySelect }) => {
  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      style={{ height: "100vh", width: "100vw" }}  // Fullscreen map container
      scrollWheelZoom={true}
      zoomControl={false}      // Disable default zoom control to add a custom one
    >
      <ChangeView center={mapCenter} zoom={zoomLevel} />
      
      {/* Using CARTO's 'light_all' tiles to emulate a flat, minimal style */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />

      {underservedData.map(
        (community, index) =>
          community.coords && (
            <Marker
              key={index}
              position={community.coords}
              icon={pinIcon}      // Use the updated smaller, flat icon
              eventHandlers={{
                click: () => onCommunitySelect(community),
              }}
            >
              <Popup>
                <strong>{community.name}</strong>
                <br />
                School Distance: {community.school_dist} km
                <br />
                Healthcare Distance: {community.healthcare_dist} km
              </Popup>
            </Marker>
          )
      )}
      
      {/* Adding a custom zoom control positioned at bottom-right */}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default Map;

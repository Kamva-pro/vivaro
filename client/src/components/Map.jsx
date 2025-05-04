import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const largeRedIcon = new L.Icon({
  iconUrl: "/assets/landmark-icon.png",
  iconSize: [15, 15],
  iconAnchor: [15, 30],
  popupAnchor: [1, -34],
});

const Map = ({ mapCenter, zoomLevel, underservedData, onCommunitySelect }) => {
  return (
    <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: "100%", width: "100%" }}>
      <ChangeView center={mapCenter} zoom={zoomLevel} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {underservedData.map(
        (community, index) =>
          community.coords && (
            <Marker
              key={index}
              position={community.coords}
              icon={largeRedIcon}
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
    </MapContainer>
  );
};

export default Map;

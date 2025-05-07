import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = new L.Icon({
  iconUrl:
    "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
  iconSize: [20, 34],
  iconAnchor: [10, 34],
  popupAnchor: [1, -28],
  shadowUrl: null,
});

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

const Map = ({ mapCenter, zoomLevel = 20, underservedData, onCommunitySelect }) => {
  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      style={{ height: "100%", width: "100%" }}  // <-- Changed from 100vh/100vw to 100%
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <ChangeView center={mapCenter} zoom={zoomLevel} />
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
              icon={pinIcon}
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
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default Map;

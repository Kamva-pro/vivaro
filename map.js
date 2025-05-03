// Initialize Leaflet map centered on South Africa
var map = L.map('map').setView([-30.5595, 22.9375], 6);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Create a custom red icon for underserved communities
var largeRedIcon = L.icon({
  iconUrl: "assets/landmark-icon.png",
  iconSize: [15, 15],
  iconAnchor: [15, 30],
  popupAnchor: [1, -34]
});

// Global variable to store AI recommendations returned from the API
var aiRecommendations = [];

// Global array to store recommendation markers on the map
window.recommendationMarkers = [];

// Function to fetch and display underserved community data
function fetchUnderservedData() {
  fetch("http://127.0.0.1:8000/underserved")
    .then(response => response.json())
    .then(data => {
      aiRecommendations = data.recommendations || [];
      console.log("AI Recommendations:", aiRecommendations);
      console.log("Underserved Data:", data.underserved);

      let totalCities = data.total_cities;
      let underservedCommunities = data.underserved;
      let totalUnderserved = underservedCommunities.length;
      let schoolUnderserved = underservedCommunities.filter(c => c.school_dist > 10).length;
      let healthcareUnderserved = underservedCommunities.filter(c => c.healthcare_dist > 10).length;

      // Update the static part of the side panel
      document.getElementById("totalCities").textContent = totalCities;
      document.getElementById("underservedCount").textContent = totalUnderserved;
      document.getElementById("schoolUnderserved").textContent = schoolUnderserved;
      document.getElementById("healthcareUnderserved").textContent = healthcareUnderserved;

      // Generate Chart for Facility Gaps
      var ctx = document.getElementById('statsChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ["Schools Underserved", "Healthcare Underserved"],
          datasets: [{
            data: [schoolUnderserved, healthcareUnderserved],
            backgroundColor: ["#ff4d4d", "#4d79ff"]
          }]
        }
      });

      // Add markers for underserved communities
      underservedCommunities.forEach(community => {
        if (community.coords) {
          console.log(`Adding marker for ${community.name} at`, community.coords);
          let marker = L.marker([community.coords[0], community.coords[1]], { icon: largeRedIcon })
            .addTo(map)
            .bindPopup(`<b>${community.name}</b><br>
                        🏫 School Distance: ${community.school_dist} km<br>
                        🏥 Healthcare Distance: ${community.healthcare_dist} km`);

          // On marker click, update the details panel
          marker.on("click", () => {
            updateDetailsPanel(community);
          });
        } else {
          console.warn(`Missing coordinates for: ${community.name}`);
        }
      });
    })
    .catch(error => console.error("Error fetching underserved data:", error));
}

// Function to update the details panel with community info and facility recommendations
function updateDetailsPanel(community) {
  // Clear any previously added recommended facility markers from the map
  if (window.recommendationMarkers && window.recommendationMarkers.length > 0) {
    window.recommendationMarkers.forEach(marker => map.removeLayer(marker));
  }
  window.recommendationMarkers = [];

  // Build the details HTML using the community's basic info
  let detailsHTML = `
      <h2>${community.name} - Detailed Analysis</h2>
      <p><strong>School Distance:</strong> ${community.school_dist} km</p>
      <p><strong>Healthcare Distance:</strong> ${community.healthcare_dist} km</p>
  `;
  document.getElementById("details").innerHTML = detailsHTML;
  
  // Use strict (or fuzzy if needed) matching to find the recommendation for this community
  let rec = (aiRecommendations || []).find(item => 
    item.name.trim().toLowerCase() === community.name.trim().toLowerCase()
  );
  
  if (rec && rec.recommended_facility) {
    let recHTML = `<h3>AI Facility Recommendations</h3>`;
    
    // Recommended School Marker (using default marker and then adding a CSS class via an event listener)
    if (rec.recommended_facility.school) {
      recHTML += `<p>🏫 New School: ${rec.recommended_facility.school[0]}, ${rec.recommended_facility.school[1]}</p>`;
      let schoolMarker = L.marker(rec.recommended_facility.school) // default marker icon
        .addTo(map)
        .bindPopup(`<b>Recommended School</b> for ${community.name}`);
      schoolMarker.on('add', function() {
        if (this._icon) {
          this._icon.classList.add('recommended-marker');
        }
      });
      window.recommendationMarkers.push(schoolMarker);
    }
    
    // Recommended Clinic Marker
    if (rec.recommended_facility.clinic) {
      recHTML += `<p>🏥 New Clinic: ${rec.recommended_facility.clinic[0]}, ${rec.recommended_facility.clinic[1]}</p>`;
      let clinicMarker = L.marker(rec.recommended_facility.clinic) // default marker icon
        .addTo(map)
        .bindPopup(`<b>Recommended Clinic</b> for ${community.name}`);
      clinicMarker.on('add', function() {
        if (this._icon) {
          this._icon.classList.add('recommended-marker');
        }
      });
      window.recommendationMarkers.push(clinicMarker);
    }
    
    // Append a justification message
    recHTML += `<p><i>Justification: Based on our AI analysis of facility density and travel distances, these locations maximize accessibility for the community.</i></p>`;
    
    document.getElementById("details").innerHTML += recHTML;
  } else {
    document.getElementById("details").innerHTML += `<p>No AI recommendations available for this community.</p>`;
  }
}

function searchCity() {
  let cityName = document.getElementById("searchBox").value.trim();
  if (!cityName) return;

  // Call OpenStreetMap's Nominatim API for search
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`)
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        alert("City not found.");
        return;
      }
      let cityCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      map.setView(cityCoords, 10);
      // Analyze city underserved status via FastAPI
      fetch(`http://127.0.0.1:8000/analyze?lat=${cityCoords[0]}&lon=${cityCoords[1]}`)
        .then(response => response.json())
        .then(analysisData => {
          document.getElementById("details").innerHTML = `
              <h2>${cityName} - City Analysis</h2>
              <p><strong>Latitude:</strong> ${cityCoords[0]}</p>
              <p><strong>Longitude:</strong> ${cityCoords[1]}</p>
              <p><strong>Nearest School:</strong> ${analysisData.nearest_school_dist} km</p>
              <p><strong>Nearest Healthcare:</strong> ${analysisData.nearest_healthcare_dist} km</p>
              <p><strong>Underserved Status:</strong> ${analysisData.underserved ? "🚨 Yes" : "✅ No"}</p>
              <button onclick="resetMap()">🔄 Back to Overview</button>
          `;

          L.marker(cityCoords)
            .addTo(map)
            .bindPopup(`<b>${cityName}</b><br>
                        🏫 Nearest School: ${analysisData.nearest_school_dist} km<br>
                        🏥 Nearest Healthcare: ${analysisData.nearest_healthcare_dist} km<br>
                        🚨 ${analysisData.underserved ? "Underserved Area!" : "Adequate Services Available"}`)
            .openPopup();
        })
        .catch(error => console.error("Error analyzing city:", error));
    })
    .catch(error => console.error("Error searching city:", error));
}

// Function to reset the map and restore the default stats pane while preserving the search bar
function resetMap() {
  map.setView([-30.5595, 22.9375], 6);
  document.getElementById("details").innerHTML = `
      <h2>Underserved Community Stats</h2>
      <p><strong>Total Cities:</strong> <span id="totalCities">Loading...</span></p>
      <p><strong>Underserved Cities:</strong> <span id="underservedCount">Loading...</span></p>
      <p><strong>Schools Underserved:</strong> <span id="schoolUnderserved">Loading...</span></p>
      <p><strong>Healthcare Underserved:</strong> <span id="healthcareUnderserved">Loading...</span></p>
      <canvas id="statsChart"></canvas>
  `;
  fetchUnderservedData();
}

// Fetch data when the page loads
fetchUnderservedData();

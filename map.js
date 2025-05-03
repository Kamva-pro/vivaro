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

// Function to fetch and display underserved community data
function fetchUnderservedData() {
    fetch("http://127.0.0.1:8000/underserved")
    .then(response => response.json())
    .then(data => {
        console.log("Underserved Data:", data.underserved);

        let totalCities = data.total_cities;
        let totalUnderserved = data.underserved.length;
        let schoolUnderserved = data.underserved.filter(c => c.school_dist > 10).length;
        let healthcareUnderserved = data.underserved.filter(c => c.healthcare_dist > 10).length;

        // Update Statistics Panel
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
        data.underserved.forEach(community => {
            if (community.coords) {
                console.log(`Adding marker for ${community.name} at`, community.coords);
                
                L.marker([community.coords[0], community.coords[1]], { icon: largeRedIcon })
                    .addTo(map)
                    .bindPopup(`<b>${community.name}</b><br>
                                🏫 School Distance: ${community.school_dist} km<br>
                                🏥 Healthcare Distance: ${community.healthcare_dist} km`);
            } else {
                console.warn(`Missing coordinates for: ${community.name}`);
            }
        });
    })
    .catch(error => console.error("Error fetching underserved data:", error));
}

function searchCity() {
    let cityName = document.getElementById("searchBox").value.trim();
    if (!cityName) return;

    // Call OpenStreetMap's Nominatim API
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("City not found.");
                return;
            }

            let cityCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];

            // Move map to searched city
            map.setView(cityCoords, 10);

            // Now send coordinates to FastAPI to analyze underserved status
            fetch(`http://127.0.0.1:8000/analyze?lat=${cityCoords[0]}&lon=${cityCoords[1]}`)
                .then(response => response.json())
                .then(analysisData => {
                    // Keep the search bar and only update search results
                    document.getElementById("searchResults").innerHTML = `
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


// Function to reset the map and return to national overview
function resetMap() {
    map.setView([-30.5595, 22.9375], 6);  // Reset to South Africa overview
    document.getElementById("stats").innerHTML = `
        <h2>Underserved Community Stats</h2>
        <p><strong>Total Cities:</strong> <span id="totalCities">Loading...</span></p>
        <p><strong>Underserved Cities:</strong> <span id="underservedCount">Loading...</span></p>
        <p><strong>Underserved in Schools:</strong> <span id="schoolUnderserved">Loading...</span></p>
        <p><strong>Underserved in Healthcare:</strong> <span id="healthcareUnderserved">Loading...</span></p>
        <canvas id="statsChart"></canvas> <!-- Chart for stats -->
    `;

    fetchUnderservedData();  // Reload main dataset markers
}

// Fetch data when the page loads
fetchUnderservedData();

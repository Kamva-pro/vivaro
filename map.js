// Initialize Leaflet map centered on South Africa
var map = L.map('map').setView([-30.5595, 22.9375], 6);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Create a custom red icon for underserved communities
var largeRedIcon = L.icon({
    iconUrl: "assets/landmark-icon.png",
    iconSize: [30, 30],
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

// Fetch data when the page loads
fetchUnderservedData();

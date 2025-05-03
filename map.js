// Initialize Leaflet map centered on South Africa
var map = L.map('map').setView([-30.5595, 22.9375], 6); // Adjust zoom level

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to fetch underserved community data from FastAPI
function fetchUnderservedData() {
    fetch("http://127.0.0.1:8000/underserved")
    .then(response => response.json())
    .then(data => {
        console.log("Underserved Data:", data.underserved); // ✅ Debugging step

        data.underserved.forEach(community => {
            if (community.coords) {  // Ensure coordinates exist
                console.log(`Adding marker for ${community.name} at`, community.coords); // ✅ Debugging
            
                L.marker([community.coords[0], community.coords[1]])  // Ensure correct Lat, Long order
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

fetchUnderservedData();

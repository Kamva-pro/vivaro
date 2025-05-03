// Initialize Leaflet map centered on South Africa
var map = L.map('map').setView([-30.5595, 22.9375], 5); 

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// Create a custom red icon
var largeRedIcon = L.icon({
    iconUrl: "assets/landmark-icon.png", 
    iconSize: [30, 30], // 🔍 Make it bigger (adjust as needed)
    iconAnchor: [15, 30], // Ensures correct positioning
    popupAnchor: [1, -34]
});


// Function to fetch underserved community data from FastAPI
function fetchUnderservedData() {
    fetch("http://127.0.0.1:8000/underserved")
    .then(response => response.json())
    .then(data => {
        console.log("Underserved Data:", data.underserved); // ✅ Debugging step

        data.underserved.forEach(community => {
            if (community.coords) {  // Ensure coordinates exist
                console.log(`Adding marker for ${community.name} at`, community.coords); // ✅ Debugging
            
                L.marker([community.coords[0], community.coords[1]], { icon: largeRedIcon })  // Ensure correct Lat, Long order
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

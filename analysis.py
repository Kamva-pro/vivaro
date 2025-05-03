import geopandas as gpd
import numpy as np
from sklearn.neighbors import BallTree
import logging

# Enable logging for debugging
logging.basicConfig(level=logging.INFO)

# Distance threshold for underserved classification
THRESHOLD_KM = 10  

def analyze_underserved():
    """Run AI analysis dynamically when FastAPI calls it."""
    
    # Load data fresh on every request
    cities = gpd.read_file("data/places.geojson")
    schools = gpd.read_file("data/schools-data.geojson")
    healthcare = gpd.read_file("data/healthcare-data.geojson")

    # Convert facility locations to NumPy arrays for indexing
    school_coords = np.array([[p.geometry.y, p.geometry.x] for _, p in schools.iterrows()])
    healthcare_coords = np.array([[p.geometry.y, p.geometry.x] for _, p in healthcare.iterrows()])

    # Build BallTree spatial index
    school_tree = BallTree(np.radians(school_coords), metric='haversine')
    healthcare_tree = BallTree(np.radians(healthcare_coords), metric='haversine')

    def fast_nearest_facility(city_coords, tree):
        """Find the nearest facility using spatial indexing."""
        dist, _ = tree.query([np.radians(city_coords)], k=1)  # Get nearest neighbor in radians
        return dist[0][0] * 6371  # Convert to kilometers

    # Identify underserved cities dynamically
    underserved_cities = []

    for i, city in enumerate(cities.itertuples()):
        city_coords = [city.geometry.y, city.geometry.x]
        
        # Print progress every 100 cities
        if i % 100 == 0:
            logging.info(f"Processing city {i}/{len(cities)}: {city.name}")

        school_dist = fast_nearest_facility(city_coords, school_tree)
        healthcare_dist = fast_nearest_facility(city_coords, healthcare_tree)
        
        if school_dist > THRESHOLD_KM or healthcare_dist > THRESHOLD_KM:
            underserved_cities.append({
                "name": city.name,
                "coords": city_coords,
                "school_dist": round(school_dist, 2),
                "healthcare_dist": round(healthcare_dist, 2)
            })

    logging.info(f"Identified {len(underserved_cities)} underserved communities.")
    return underserved_cities

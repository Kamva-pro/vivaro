import geopandas as gpd
import numpy as np
from shapely.geometry import Point
from sklearn.neighbors import BallTree
import logging

logging.basicConfig(level=logging.INFO)

# Load processed city and facility data
cities = gpd.read_file("data/places.geojson")
schools = gpd.read_file("data/schools-data.geojson")
healthcare = gpd.read_file("data/healthcare-data.geojson")

# Urban planning thresholds based on facility density per area
MIN_SCHOOLS_PER_KM2 = 1 / 10  # 🔍 1 primary school per 10 km²
MIN_CLINICS_PER_KM2 = 1 / 20  # 🔍 1 clinic per 20 km²
THRESHOLD_KM = 10  # Max distance from city center to facility

# Prepare BallTree spatial index for fast facility lookup
school_coords = np.array([[p.geometry.y, p.geometry.x] for _, p in schools.iterrows()])
healthcare_coords = np.array([[p.geometry.y, p.geometry.x] for _, p in healthcare.iterrows()])

school_tree = BallTree(np.radians(school_coords), metric='haversine')
healthcare_tree = BallTree(np.radians(healthcare_coords), metric='haversine')

def fast_nearest_facility(city_coords, tree):
    """Find the nearest facility using spatial indexing."""
    dist, _ = tree.query([np.radians(city_coords)], k=1)
    return dist[0][0] * 6371  # Convert radians to kilometers

def analyze_underserved():
    underserved_cities = []
    
    for city in cities.itertuples():
        city_coords = [city.geometry.y, city.geometry.x]  # ✅ Convert Point to List
        city_name = city.name
        city_area_km2 = city.geometry.area / 1e6
        
        num_schools = schools.within(city.geometry).sum()
        num_healthcare = healthcare.within(city.geometry).sum()

        school_density = num_schools / city_area_km2 if city_area_km2 > 0 else 0
        healthcare_density = num_healthcare / city_area_km2 if city_area_km2 > 0 else 0

        # Compute distances to nearest facilities
        school_dist = fast_nearest_facility(city_coords, school_tree)
        healthcare_dist = fast_nearest_facility(city_coords, healthcare_tree)

        # Flag underserved cities
        if (school_density < MIN_SCHOOLS_PER_KM2 and school_dist > THRESHOLD_KM) or \
           (healthcare_density < MIN_CLINICS_PER_KM2 and healthcare_dist > THRESHOLD_KM):
            underserved_cities.append({
                "name": city_name,
                "coords": city_coords,
                "school_dist": round(school_dist, 2),
                "healthcare_dist": round(healthcare_dist, 2),
                "school_density": round(school_density, 3),
                "healthcare_density": round(healthcare_density, 3),
                "city_area_km2": round(city_area_km2, 2)
            })

    logging.info(f"Identified {len(underserved_cities)} underserved communities.")
    return underserved_cities  # ✅ Do NOT return the entire cities dataset
   
import geopandas as gpd
import numpy as np
from shapely.geometry import Point
from sklearn.neighbors import BallTree
import logging

logging.basicConfig(level=logging.INFO)

cities = gpd.read_file("data/places.geojson")
schools = gpd.read_file("data/schools-data.geojson")
healthcare = gpd.read_file("data/healthcare-data.geojson")

MIN_SCHOOLS_PER_KM2 = 1 / 10  
MIN_CLINICS_PER_KM2 = 1 / 20  
THRESHOLD_KM = 10  

school_coords = np.array([[p.geometry.y, p.geometry.x] for _, p in schools.iterrows()])
healthcare_coords = np.array([[p.geometry.y, p.geometry.x] for _, p in healthcare.iterrows()])

school_tree = BallTree(np.radians(school_coords), metric='haversine')
healthcare_tree = BallTree(np.radians(healthcare_coords), metric='haversine')

def fast_nearest_facility(city_coords, tree):
    """Find the nearest facility using spatial indexing."""
    dist, _ = tree.query([np.radians(city_coords)], k=1)
    return dist[0][0] * 6371  

def analyze_underserved():
    underserved_cities = []
    
    # Vectorized fast nearest neighbor queries across all communities
    city_coords = np.array([[c.geometry.y, c.geometry.x] for c in cities.itertuples()])
    school_dists, _ = school_tree.query(np.radians(city_coords), k=1)
    school_dists = school_dists[:, 0] * 6371
    
    healthcare_dists, _ = healthcare_tree.query(np.radians(city_coords), k=1)
    healthcare_dists = healthcare_dists[:, 0] * 6371

    for idx, city in enumerate(cities.itertuples()):
        s_dist = school_dists[idx]
        h_dist = healthcare_dists[idx]

        if s_dist > THRESHOLD_KM or h_dist > THRESHOLD_KM:
            underserved_cities.append({
                "name": city.name,
                "coords": [city.geometry.y, city.geometry.x],
                "school_dist": round(float(s_dist), 2),
                "healthcare_dist": round(float(h_dist), 2),
                "school_density": 0.0,
                "healthcare_density": 0.0,
                "city_area_km2": 0.0
            })

    logging.info(f"Identified {len(underserved_cities)} underserved communities.")
    return underserved_cities
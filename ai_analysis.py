import geopandas as gpd
import numpy as np
from geopy.distance import geodesic
from sklearn.cluster import DBSCAN
import logging

# Enable logging for debugging
logging.basicConfig(level=logging.INFO)

# Load community centers
from process_cities import city_data  
community_centers = city_data

# Load facility data
try:
    schools = gpd.read_file("data/schools-data.geojson")
    healthcare = gpd.read_file("data/healthcare-data.geojson")
    logging.info(f"Loaded {len(schools)} schools and {len(healthcare)} healthcare facilities.")
except Exception as e:
    logging.error("Error loading facility data: ", e)
    exit()

def find_nearest_facility(community, facilities):
    """Find the nearest facility to a given community."""
    min_distance = float("inf")
    closest_facility = None
    
    # Ensure facilities have valid geometry
    facilities = facilities[facilities.geometry.notnull()]

    for _, facility in facilities.iterrows():
        try:
            facility_coords = (facility.geometry.y, facility.geometry.x)
            distance = geodesic(community["coords"], facility_coords).km
            if distance < min_distance:
                min_distance = distance
                closest_facility = facility
        except Exception as e:
            logging.warning(f"Skipping invalid facility geometry: {e}")
    
    return min_distance, closest_facility

# Threshold for underserved classification
THRESHOLD_KM = 10  
underserved_communities = []

for community in community_centers:
    school_dist, _ = find_nearest_facility(community, schools)
    healthcare_dist, _ = find_nearest_facility(community, healthcare)
    
    if school_dist > THRESHOLD_KM or healthcare_dist > THRESHOLD_KM:
        underserved_communities.append({
            "name": community["name"],
            "coords": community["coords"],
            "school_dist": round(school_dist, 2),
            "healthcare_dist": round(healthcare_dist, 2)
        })

logging.info(f"Identified {len(underserved_communities)} underserved communities.")

# Convert underserved communities to a DataFrame for clustering
import pandas as pd
df_underserved = pd.DataFrame(underserved_communities)
coords = np.array(df_underserved["coords"].tolist())

# Apply DBSCAN clustering to detect regional underserved areas
if len(coords) > 0:
    clustering = DBSCAN(eps=20, min_samples=3).fit(coords)  # Adjust distance threshold as needed
    df_underserved["cluster"] = clustering.labels_
    logging.info("Clustering complete.")

# Print results
print(df_underserved.head())

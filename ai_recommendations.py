import geopandas as gpd
import numpy as np
import logging
from shapely.geometry import Point
from sklearn.cluster import KMeans
from analysis import analyze_underserved, cities

logging.basicConfig(level=logging.INFO)

def generate_recommendations():
    """
    Generate facility recommendations for underserved communities.
    Uses K-Means clustering in a projected CRS to create candidate sites,
    then filters candidates based on proximity to cities and community needs.
    """
    # 1. Load underserved community data (including densities & distances)
    underserved_areas = analyze_underserved()

    # 2. Create a GeoSeries of underserved points (input coordinate format: [lat, lon])
    points = gpd.GeoSeries(
        [Point(city["coords"][1], city["coords"][0]) for city in underserved_areas],
        crs="EPSG:4326"
    )
    
    # 3. Reproject these points to a metric CRS (EPSG:3857)
    points_projected = points.to_crs("EPSG:3857")
    X_proj = np.array([[pt.x, pt.y] for pt in points_projected])

    # 4. Apply K-Means clustering on the projected coordinates
    n_clusters = 10  # Adjust as needed based on your underserved areas distribution.
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(X_proj)
    cluster_centers_proj = kmeans.cluster_centers_
    
    # 5. Convert cluster centers back to lat/lon (EPSG:4326) for output
    centers_geom = gpd.GeoSeries(
        [Point(x, y) for x, y in cluster_centers_proj],
        crs="EPSG:3857"
    )
    centers_latlon = centers_geom.to_crs("EPSG:4326")
    
    # 6. Reproject your cities dataset to the projected CRS (for buffer filtering)
    cities_projected = cities.to_crs("EPSG:3857")
    BUFFER_DIST = 15000  # Buffer constraint in meters (15 km)

    # Define thresholds (hardcoded here; you could also import them from analysis if available)
    SCHOOL_DENSITY_THRESHOLD = 1 / 10   # 1 school per 10 km²
    CLINIC_DENSITY_THRESHOLD = 1 / 20   # 1 clinic per 20 km²
    DISTANCE_THRESHOLD_KM = 10          # 10 km

    facility_recommendations = []

    # 7. Loop through each underserved community to generate conditional recommendations
    for i, community in enumerate(underserved_areas):
        # Get the candidate facility from the clustering result for this community.
        candidate_center_proj = cluster_centers_proj[cluster_labels[i]]
        candidate_point_proj = Point(candidate_center_proj[0], candidate_center_proj[1])
        
        # Check if any city is within BUFFER_DIST (15 km) of the candidate.
        nearby_cities = cities_projected[cities_projected.distance(candidate_point_proj) < BUFFER_DIST]
        if nearby_cities.empty:
            continue  # Skip candidate if too remote
        
        # Convert the candidate facility back to lat/lon
        candidate_point_latlon = centers_latlon[cluster_labels[i]]
        
        # Determine if this community needs a school and/or a clinic
        needs_school = (community["school_density"] < SCHOOL_DENSITY_THRESHOLD) and (community["school_dist"] > DISTANCE_THRESHOLD_KM)
        needs_clinic = (community["healthcare_density"] < CLINIC_DENSITY_THRESHOLD) and (community["healthcare_dist"] > DISTANCE_THRESHOLD_KM)
        
        recommended_facility = {}
        if needs_school:
            recommended_facility["school"] = [
                round(candidate_point_latlon.y, 6),  # Latitude
                round(candidate_point_latlon.x, 6)   # Longitude
            ]
        if needs_clinic:
            # Apply a slight offset to differentiate the clinic marker from the school
            recommended_facility["clinic"] = [
                round(candidate_point_latlon.y + 0.01, 6),
                round(candidate_point_latlon.x - 0.01, 6)
            ]
        
        # Only add a recommendation if at least one service is needed
        if recommended_facility:
            facility_recommendations.append({
                "name": community["name"],
                "coords": community["coords"],
                "recommended_facility": recommended_facility
            })

    logging.info(f"Generated {len(facility_recommendations)} facility recommendations.")
    return facility_recommendations

import geopandas as gpd
import numpy as np
import logging
from shapely.geometry import Point
from sklearn.cluster import KMeans
from analysis import analyze_underserved, cities

logging.basicConfig(level=logging.INFO)

def generate_justification(community, recommended_facility, SCHOOL_DENSITY_THRESHOLD, CLINIC_DENSITY_THRESHOLD, DISTANCE_THRESHOLD_KM):
    """
    Generate a dynamic justification based on the community's metrics.
    """
    justification_text = ""
    if "school" in recommended_facility:
        if community["school_density"] < SCHOOL_DENSITY_THRESHOLD and community["school_dist"] > DISTANCE_THRESHOLD_KM:
            justification_text += (f"Due to a very low school density ({community['school_density']:.3f} per km²) and a school distance of "
                                   f"{community['school_dist']} km, placing a new school at {recommended_facility['school']} will markedly improve access. ")
        else:
            justification_text += (f"While current school metrics are moderate, installing a school at {recommended_facility['school']} will help prepare "
                                   "for future growth. ")
    if "clinic" in recommended_facility:
        if community["healthcare_density"] < CLINIC_DENSITY_THRESHOLD and community["healthcare_dist"] > DISTANCE_THRESHOLD_KM:
            justification_text += (f"Similarly, the low healthcare density and a distance of {community['healthcare_dist']} km justify a new clinic at "
                                   f"{recommended_facility['clinic']}.")
        else:
            justification_text += (f"Although current facilities are borderline sufficient, deploying a clinic at {recommended_facility['clinic']} "
                                   "can strengthen local healthcare capacity.")
    return justification_text

def generate_recommendations():
    """
    Generate facility recommendations for underserved communities.
    Only recommends a new school or clinic if the community's metrics indicate a need.
    """
    underserved_areas = analyze_underserved()

    points = gpd.GeoSeries(
        [Point(city["coords"][1], city["coords"][0]) for city in underserved_areas],
        crs="EPSG:4326"
    )
    
    points_projected = points.to_crs("EPSG:3857")
    X_proj = np.array([[pt.x, pt.y] for pt in points_projected])

    n_clusters = 10  
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(X_proj)
    cluster_centers_proj = kmeans.cluster_centers_
    
    centers_geom = gpd.GeoSeries(
        [Point(x, y) for x, y in cluster_centers_proj],
        crs="EPSG:3857"
    )
    centers_latlon = centers_geom.to_crs("EPSG:4326")
    
    # cities_projected = cities.to_crs("EPSG:3857")
    # BUFFER_DIST = 15000  

    SCHOOL_DENSITY_THRESHOLD = 1 / 10   
    CLINIC_DENSITY_THRESHOLD = 1 / 20   
    DISTANCE_THRESHOLD_KM = 10          

    facility_recommendations = []

    for i, community in enumerate(underserved_areas):
        candidate_center_proj = cluster_centers_proj[cluster_labels[i]]
        # candidate_point_proj = Point(candidate_center_proj[0], candidate_center_proj[1])

        candidate_point_latlon = centers_latlon[cluster_labels[i]]
        
        recommended_facility = {}
        if (community["school_density"] < SCHOOL_DENSITY_THRESHOLD) and (community["school_dist"] > DISTANCE_THRESHOLD_KM):
            recommended_facility["school"] = [
                round(candidate_point_latlon.y, 6),
                round(candidate_point_latlon.x, 6)
            ]
        if (community["healthcare_density"] < CLINIC_DENSITY_THRESHOLD) and (community["healthcare_dist"] > DISTANCE_THRESHOLD_KM):
            recommended_facility["clinic"] = [
                round(candidate_point_latlon.y + 0.01, 6),
                round(candidate_point_latlon.x - 0.01, 6)
            ]
        
        if recommended_facility:
            justification = generate_justification(community, recommended_facility,
                                                    SCHOOL_DENSITY_THRESHOLD, CLINIC_DENSITY_THRESHOLD, DISTANCE_THRESHOLD_KM)
            facility_recommendations.append({
                "name": community["name"],
                "coords": community["coords"],
                "recommended_facility": recommended_facility,
                "justification": justification
            })

    logging.info(f"Generated {len(facility_recommendations)} facility recommendations.")
    return facility_recommendations

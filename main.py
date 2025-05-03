from fastapi import FastAPI, HTTPException
import json
import numpy as np  

import os
from shapely.geometry import Point  

from analysis import analyze_underserved, fast_nearest_facility, cities, schools, healthcare, school_tree, healthcare_tree, MIN_SCHOOLS_PER_KM2, MIN_CLINICS_PER_KM2, THRESHOLD_KM
from fastapi.middleware.cors import CORSMiddleware

# print("Analyzed underserved: ", analyze_underserved())
app = FastAPI(title="Vivaro API")

# Configure CORS to allow requests from your frontend (http://127.0.0.1:5500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

# Define file paths
SCHOOLS_FILE = "data/schools-data.geojson"
HEALTHCARE_FILE = "data/healthcare-data.geojson"

def load_geojson(file_path):
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading {file_path}: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Vivaro API is running. Use /schools or /healthcare to fetch facility data"}

@app.get("/schools")
def get_schools():
    return load_geojson(SCHOOLS_FILE)

@app.get("/healthcare")
def get_healthcare():
    return load_geojson(HEALTHCARE_FILE)

@app.get("/underserved")
def get_underserved_communities():
    results = analyze_underserved()  
    
    if not results:
        return {"error": "No underserved communities found"}

    return {
        "total_cities": len(cities),  
        "underserved": results
    }

@app.get("/search")
def search_city(city_name: str):
    """Search for any city and analyze its underserved status dynamically."""
    city_match = cities[cities["name"].str.lower() == city_name.lower()]
    if city_match.empty:
        return {"error": f"City '{city_name}' not found in dataset"}

    city_data = city_match.iloc[0]
    city_coords = [city_data.geometry.y, city_data.geometry.x]

    # Find nearest school and healthcare facilities
    nearest_school_dist = fast_nearest_facility(city_coords, school_tree)
    nearest_healthcare_dist = fast_nearest_facility(city_coords, healthcare_tree)

    # Count number of facilities in the city
    num_schools = schools.within(city_data.geometry).sum()
    num_healthcare = healthcare.within(city_data.geometry).sum()

    # Calculate school and healthcare density
    city_area_km2 = city_data.geometry.area / 1e6
    school_density = num_schools / city_area_km2 if city_area_km2 > 0 else 0
    healthcare_density = num_healthcare / city_area_km2 if city_area_km2 > 0 else 0

    # Determine if the city is underserved dynamically
    is_underserved = (school_density < MIN_SCHOOLS_PER_KM2 and nearest_school_dist > THRESHOLD_KM) or \
                     (healthcare_density < MIN_CLINICS_PER_KM2 and nearest_healthcare_dist > THRESHOLD_KM)

    return {
        "name": city_data["name"],
        "coords": city_coords,
        "school_count": num_schools,
        "healthcare_count": num_healthcare,
        "nearest_school_dist": round(nearest_school_dist, 2),
        "nearest_healthcare_dist": round(nearest_healthcare_dist, 2),
        "school_density": round(school_density, 3),
        "healthcare_density": round(healthcare_density, 3),
        "city_area_km2": round(city_area_km2, 2),
        "underserved": is_underserved  # ✅ Dynamically analyzed
    }

@app.get("/analyze")
def analyze_city(lat: float, lon: float):
    """Dynamically analyze whether a city is underserved based on coordinates."""
    city_coords = [lat, lon]

    # Find nearest school and healthcare facilities
    nearest_school_dist = fast_nearest_facility(city_coords, school_tree)
    nearest_healthcare_dist = fast_nearest_facility(city_coords, healthcare_tree)

    # Count nearby schools and healthcare facilities within a radius
    num_schools = schools.within(Point(lon, lat).buffer(0.1)).sum()  # Approx. 10km radius
    num_healthcare = healthcare.within(Point(lon, lat).buffer(0.1)).sum()

    # Calculate density using an approximate area (assuming a 10km radius)
    city_area_km2 = np.pi * (10 ** 2)  # ~314 km²
    school_density = num_schools / city_area_km2
    healthcare_density = num_healthcare / city_area_km2

    # Determine underserved status dynamically (Fix NumPy boolean issue)
    is_underserved = bool(
        (school_density < MIN_SCHOOLS_PER_KM2 and nearest_school_dist > THRESHOLD_KM) or
        (healthcare_density < MIN_CLINICS_PER_KM2 and nearest_healthcare_dist > THRESHOLD_KM)
    )

    return {
        "nearest_school_dist": round(nearest_school_dist, 2),
        "nearest_healthcare_dist": round(nearest_healthcare_dist, 2),
        "school_density": round(school_density, 3),
        "healthcare_density": round(healthcare_density, 3),
        "underserved": is_underserved  # ✅ Converted to standard Python boolean
    }

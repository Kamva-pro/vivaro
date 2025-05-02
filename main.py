from fastapi import FastAPI, HTTPException
import json
import os

app = FastAPI(title="Vivaro API")

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

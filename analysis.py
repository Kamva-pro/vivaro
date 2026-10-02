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

PROVINCE_NAMES = [
    'Eastern Cape', 'Western Cape', 'Northern Cape', 'Free State',
    'KwaZulu-Natal', 'North West', 'Gauteng', 'Mpumalanga', 'Limpopo'
]

# Build spatial reference trees for province and city lookups
_known_prov_coords = []
_known_prov_names = []
_city_coords = []
_city_names = []
_town_coords = []
_town_names = []

for _, p in cities.iterrows():
    isin = p.get('is_in', '') or ''
    found_prov = None
    for prov in PROVINCE_NAMES:
        if prov.lower() in str(isin).lower():
            found_prov = prov
            break
    if found_prov:
        _known_prov_coords.append([p.geometry.y, p.geometry.x])
        _known_prov_names.append(found_prov)
    
    place_type = p.get('place', '')
    p_name = p.get('name') or 'Settlement'
    if place_type == 'city':
        _city_coords.append([p.geometry.y, p.geometry.x])
        _city_names.append(p_name)
    if place_type in ('town', 'city'):
        _town_coords.append([p.geometry.y, p.geometry.x])
        _town_names.append(p_name)

_prov_tree = BallTree(np.radians(_known_prov_coords), metric='haversine') if _known_prov_coords else None
_city_tree = BallTree(np.radians(_city_coords), metric='haversine') if _city_coords else None
_town_tree = BallTree(np.radians(_town_coords), metric='haversine') if _town_coords else None

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
            lat = city.geometry.y
            lon = city.geometry.x
            name = city.name or "Settlement"
            
            if lat < -40:
                prov = "Prince Edward Islands"
                nearest_town = "Sub-Antarctic Territory"
                region = "Prince Edward Islands"
                full_loc = f"{name}, Prince Edward Islands"
            else:
                rad = np.array([[np.radians(lat), np.radians(lon)]])
                _, p_idx = _prov_tree.query(rad, k=1) if _prov_tree else (None, [[0]])
                prov = _known_prov_names[p_idx[0][0]] if _prov_tree else "South Africa"
                
                d_town, t_idx = _town_tree.query(rad, k=1) if _town_tree else (None, [[0]])
                dist_t_km = d_town[0][0] * 6371 if _town_tree else 999
                nearest_town = _town_names[t_idx[0][0]] if _town_tree else name
                
                d_city, c_idx = _city_tree.query(rad, k=1) if _city_tree else (None, [[0]])
                dist_c_km = d_city[0][0] * 6371 if _city_tree else 999
                nearest_city = _city_names[c_idx[0][0]] if _city_tree else name

                if "eldorado" in name.lower():
                    nearest_town = "Blouberg / Louis Trichardt"
                    region = f"Blouberg, {prov}"
                    full_loc = f"Eldorado, Blouberg ({prov})"
                elif dist_t_km < 1.5 or name.lower() == nearest_town.lower():
                    region = prov
                    full_loc = f"{name}, {prov}"
                elif dist_c_km < 35 and nearest_city.lower() != name.lower():
                    nearest_town = nearest_city
                    region = f"{nearest_city}, {prov}"
                    full_loc = f"{name}, {nearest_city} ({prov})"
                else:
                    region = f"{nearest_town}, {prov}"
                    full_loc = f"{name}, near {nearest_town} ({prov})"

            underserved_cities.append({
                "name": name,
                "coords": [lat, lon],
                "school_dist": round(float(s_dist), 2),
                "healthcare_dist": round(float(h_dist), 2),
                "school_density": 0.0,
                "healthcare_density": 0.0,
                "city_area_km2": 0.0,
                "province": prov,
                "city": nearest_town,
                "region": region,
                "full_location": full_loc
            })

    logging.info(f"Identified {len(underserved_cities)} underserved communities.")
    return underserved_cities
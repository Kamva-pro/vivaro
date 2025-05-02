import json
from shapely.geometry import shape, mapping

def fix_geometry(geom_dict):
    # Preliminary check: If geometry is a Polygon, ensure the first ring has at least 4 coordinates.
    if geom_dict.get('type') == "Polygon":
        coords = geom_dict.get("coordinates", [])
        if not coords or not coords[0] or len(coords[0]) < 4:
            print("Skipping invalid polygon (insufficient points):", geom_dict)
            return None

    try:
        geom = shape(geom_dict)
    except Exception as e:
        print("Error converting geometry with error {}:".format(e), geom_dict)
        return None

    if not geom.is_valid:
        try:
            # Attempt to fix common geometry problems
            fixed_geom = geom.buffer(0)
            if fixed_geom.is_valid:
                return mapping(fixed_geom)
            else:
                # If still not valid, return the original geometry mapping
                return mapping(geom)
        except Exception as e:
            print("Failed to fix geometry:", e)
            return None

    return geom_dict

# Specify input and output file names.
input_file = 'schools-data.geojson'
output_file = 'cleaned-schools-data.geojson'

# Load the GeoJSON file.
with open(input_file, 'r') as f:
    data = json.load(f)

# Process and clean each feature.
cleaned_features = []
for feature in data['features']:
    if 'geometry' in feature and feature['geometry'] is not None:
        fixed_geometry = fix_geometry(feature['geometry'])
        if fixed_geometry is not None:
            feature['geometry'] = fixed_geometry
            cleaned_features.append(feature)
        else:
            print("Skipping feature due to invalid geometry:", feature.get('properties', {}))
    else:
        print("Skipping feature missing geometry:", feature.get('properties', {}))

# Update the feature list in your GeoJSON data.
data['features'] = cleaned_features

# Write the cleaned data back to a new file.
with open(output_file, 'w') as f:
    json.dump(data, f)

print("Finished cleaning the GeoJSON. Saved to:", output_file)

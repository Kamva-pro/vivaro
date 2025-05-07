import geopandas as gpd

# Load the GeoJSON file
cities = gpd.read_file("data/cities.geojson")

# Check the first few rows
print(cities.head())

# Verify coordinate system
print("CRS:", cities.crs)

# Plot the locations for a quick visual check
cities.plot(figsize=(10, 10), color="blue", markersize=5)

city_data = []
for _, row in cities.iterrows():
    city_data.append({
        "name": row["name"],
        "coords": (row.geometry.y, row.geometry.x)  # Latitude, Longitude
    })

print("Total cities loaded:", len(city_data))
print(city_data[:5])  # Sample data

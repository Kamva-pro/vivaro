import geopandas as gpd
import matplotlib.pyplot as plt

# Load Data
schools = gpd.read_file('cleaned-schools-data.geojson')
print("Number of schools loaded:", len(schools))
print(schools.head())

healthcare = gpd.read_file('healthcare-data.geojson')
print("Number of healthcare facilities loaded:", len(healthcare))
print(healthcare.head())

#Plot the data to visually inspect
ax = schools.plot(color='blue', marker='o', figsize=(10, 10), label='Schools')
healthcare.plot(ax=ax, color='red', marker='x', label='Healthcare')
plt.legend()
plt.title("Schools and Healthcare Facilities in South Africa")
plt.show()

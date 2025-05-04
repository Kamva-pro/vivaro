let cachedData = null;

export const fetchUnderservedData = async () => {
  if (cachedData) {
    return cachedData; // Return cached data if available
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/underserved");
    const data = await response.json();
    cachedData = data; // Cache the data for reuse
    return data;
  } catch (error) {
    console.error("Error fetching underserved data:", error);
    throw error;
  }
};
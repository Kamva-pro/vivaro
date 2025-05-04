let cachedData = null;

export const fetchUnderservedData = async () => {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/underserved");
    const data = await response.json();

    const globalRecommendations = data.recommendations || [];

    if (data && data.underserved && Array.isArray(data.underserved)) {
      data.underserved = data.underserved.map((community) => {
        const communityName = community.name ? community.name.trim().toLowerCase() : "";

        const isUnderserved =
          community.underserved !== undefined
            ? community.underserved
            : (community.school_dist > 10 || community.healthcare_dist > 10);

        const recommendationItem = globalRecommendations.find((rec) => {
          const recName = rec && rec.name ? rec.name.trim().toLowerCase() : "";
          return recName && communityName && recName === communityName;
        });

        let recommendations = null;
        if (recommendationItem && recommendationItem.recommended_facility) {
          recommendations = {
            newSchool: recommendationItem.recommended_facility.school
              ? `${recommendationItem.recommended_facility.school[0]}, ${recommendationItem.recommended_facility.school[1]}`
              : "",
            newClinic: recommendationItem.recommended_facility.clinic
              ? `${recommendationItem.recommended_facility.clinic[0]}, ${recommendationItem.recommended_facility.clinic[1]}`
              : "",
            justification: recommendationItem.justification || "",
          };
        }

        return {
          ...community,
          underserved: isUnderserved,
          recommendations: recommendations,
        };
      });
    }

    cachedData = data;
    return data;
  } catch (error) {
    console.error("Error fetching underserved data:", error);
    throw error;
  }
};

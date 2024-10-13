export const fetchPlaces = async (city) => {
    const response = await fetch(`http://localhost:5000/places?city=${city}`);
    return response.json();
};
  
  
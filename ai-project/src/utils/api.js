export const fetchPlaces = async (city) => {
    const response = await fetch(`http://localhost:5000/places?city=${city}`);
    return response.json();
  };
  
  export const savePlaces = async (selectedPlaces) => {
    const data = selectedPlaces.map(place => ({ name: place.name, lat: place.lat, lon: place.lon }));
    await fetch('http://localhost:5000/save_places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };
  
import React, { useState } from 'react';

function App() {
  const [city, setCity] = useState('');
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleSearch = async () => {
    const response = await fetch(`http://localhost:5000/places?city=${city}`);
    const data = await response.json();
    setPlaces(data.places);
  };

  const handleAddPlace = (place) => {
    setSelectedPlaces([...selectedPlaces, place]);
  };

  return (
    <div className="App">
      <h1>Travel Planner</h1>
      
      {/* City Input */}
      <input 
        type="text" 
        value={city} 
        onChange={handleCityChange} 
        placeholder="Enter a city"
      />
      <button onClick={handleSearch}>Search Famous Places</button>
      
      {/* Show Famous Places */}
      <h2>Famous Places in {city}</h2>
      <ul>
        {places.map((place, index) => (
          <li key={index}>
            {place.name} 
            <button onClick={() => handleAddPlace(place)}>Add to Itinerary</button>
          </li>
        ))}
      </ul>
      
      {/* Selected Places */}
      <h2>Your Itinerary</h2>
      <ul>
        {selectedPlaces.map((place, index) => (
          <li key={index}>{place.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

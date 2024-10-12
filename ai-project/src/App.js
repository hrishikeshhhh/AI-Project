import React, { useState } from 'react';
import './App.css';

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
      
      {/* Search Section */}
      <div className = 'search-secton'> 
        <h1>Which place would you like to explore?</h1>
        <div className='search-bar'>
          {/* City Input */}
          <input 
            type="text" 
            value={city} 
            onChange={handleCityChange} 
            placeholder="Enter a city"
          />
          <button onClick={handleSearch}>
            <span className="material-icons">search</span> {/* Material Icon */}
          </button>
        </div>
      </div>
      
      
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

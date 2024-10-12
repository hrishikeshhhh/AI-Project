import React, { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!city) {
      alert('Please enter a city');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/places?city=${city}`);
      const data = await response.json();
      setPlaces(data.places);
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const handleAddPlace = (place) => {
    if (!selectedPlaces.includes(place)) {
      setSelectedPlaces([...selectedPlaces, place]);
    }
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
            onKeyDown={handleKeyDown}
            placeholder="Enter a city"
          />
          <button onClick={handleSearch}>
            <span className="material-icons">search</span> {/* Material Icon */}
          </button>
        </div>
      </div>
      
      {/* Famous Places Section */}
      {places.length > 0 && (
        <div className="places-section">
          <h2>Famous Places in {city}</h2>
          <div className="places-grid">
            {places.map((place, index) => (
              <div key={index} className="place-card">
                <img 
                  src={place.image} 
                  alt={place.name} 
                  className="place-image"
                  onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
                />
                <h3>{place.name}</h3>
                <button onClick={() => handleAddPlace(place)}>Add to Itinerary</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
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

import React, { useState } from 'react';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

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
      setShowPopup(true);
    }
  };

  const handleRemovePlace = (place) => {
    const updatedPlaces = selectedPlaces.filter(
      (selectedPlace) => selectedPlace !== place
    );
    setSelectedPlaces(updatedPlaces);
    if (updatedPlaces.length === 0) {
      setShowPopup(false);
    }
  };

  const handleGoToMap = async () => {
    const data = selectedPlaces.map(place => ({name: place.name, lat: place.lat, lon: place.lon}));

    // Redirect to map page
    window.location.href = `http://localhost:3000/map?places=${JSON.stringify(data)}`;
    

    try {
      const response = await fetch('http://localhost:5000/save_places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        console.log('Data sent successfully');
      } else {
        console.error('Failed to send data');
      }
    } catch (error) {
      console.error('Error sending data:', error);
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
            <span className="material-icons">search</span>
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
      {showPopup && (
        <div className="popup">
          <h2>Your Itinerary</h2>
          <div className="popup-list">
            <ul>
              {selectedPlaces.map((place, index) => (
                <li key={index}>
                  {place.name}
                  <button onClick={() => handleRemovePlace(place)}>
                    <span className="material-icons">delete</span>  
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <button className="map-button" onClick={handleGoToMap}>
            Go to Map
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import './styles/App.css';
import SearchBar from './components/SearchBar';
import PlacesList from './components/PlacesList';
import Popup from './components/Popup';
import MapPage from './components/MapPage.js';

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
      setSelectedPlaces([]);
      setShowPopup(false);
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
    const data = selectedPlaces.map((place) => ({
      name: place.name,
      lat: place.lat,
      lon: place.lon,
    }));
    
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
        // Optionally navigate to map page after saving places
        window.location.href = `/map?places=${JSON.stringify(data)}`;
      } else {
        console.error('Failed to send data');
      }
    } catch (error) {
      console.error('Error sending data:', error);
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SearchBar
                city={city}
                onCityChange={handleCityChange}
                onSearch={handleSearch}
                onKeyDown={handleKeyDown}
              />
              {places.length > 0 && (
                <PlacesList city={city} places={places} onAddPlace={handleAddPlace} />
              )}
              {showPopup && (
                <Popup
                  selectedPlaces={selectedPlaces}
                  onRemovePlace={handleRemovePlace}
                  onGoToMap={handleGoToMap}
                />
              )}
            </>
          }
        />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </div>
  );
}

export default App;

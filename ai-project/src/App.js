import React, { useState } from 'react';
import './App.css';
import SearchBar from './components/SearchBar';
import PlacesList from './components/PlacesList';
import Popup from './components/Popup';
import { fetchPlaces, savePlaces } from './utils/api';

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
      const data = await fetchPlaces(city);
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
    window.location.href = `http://localhost:3000/map?places=${JSON.stringify(selectedPlaces)}`;
    await savePlaces(selectedPlaces);
  };

  return (
    <div className="App">
      {/* Search Section */}
      <SearchBar 
        city={city} 
        onCityChange={handleCityChange} 
        onSearch={handleSearch} 
        onKeyDown={handleKeyDown}
      />

      {/* Famous Places Section */}
      {places.length > 0 && (
        <PlacesList 
          places={places} 
          onAddPlace={handleAddPlace}
        />
      )}

      {/* Selected Places */}
      {showPopup && (
        <Popup 
          selectedPlaces={selectedPlaces} 
          onRemovePlace={handleRemovePlace} 
          onGoToMap={handleGoToMap}
        />
      )}
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import './styles/App.css';
import SearchBar from './components/SearchBar';
import PlacesList from './components/PlacesList';
import Popup from './components/Popup';
import { fetchPlaces} from './utils/api';

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
      <SearchBar 
        city={city} 
        onCityChange={handleCityChange} 
        onSearch={handleSearch} 
        onKeyDown={handleKeyDown}
      />

      {/* Famous Places Section */}
      {places.length > 0 && (
        <PlacesList 
          city = {city}
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

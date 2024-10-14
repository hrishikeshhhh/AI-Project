import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MapPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const places = JSON.parse(searchParams.get('places') || '[]');

  useEffect(() => {
    // Initialize Google Maps
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: places[0]?.lat || 0, lng: places[0]?.lon || 0 }, // Center on the first place
      zoom: 12,
    });

    // Add markers for each place
    places.forEach(place => {
      new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lon },
        map: map,
        title: place.name,
      });
    });
  }, [places]);

  return (
    <div>
      <h1>Map Page</h1>
      <p>Map showing the selected places:</p>
      <div id="map" style={{ width: '100%', height: '500px', border: '1px solid black' }}></div>
    </div>
  );
};

export default MapPage;
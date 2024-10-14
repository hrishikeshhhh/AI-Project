import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/MapPage.css';

const MapPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const places = JSON.parse(searchParams.get('places') || '[]');

  const [routeInfo, setRouteInfo] = useState({
    type: 'Fastest Route (Dijkstra)', // Default route type
    time: '1 hr 30 mins', // Dummy value for total time
    distance: '50 km', // Dummy value for total distance
  });

  useEffect(() => {
    const map = new window.google.maps.Map(document.getElementById('map'), {
      center: { lat: places[0]?.lat || 0, lng: places[0]?.lon || 0 }, // Center on the first place
      zoom: 12,
    });

    // markers for each place
    places.forEach((place) => {
      new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lon },
        map: map,
        title: place.name,
      });
    });
  }, [places]);

  const handleFastestRoute = () => {
    // Simulate backend call for fastest route (Dijkstra's algorithm)
    setRouteInfo({
      type: 'Fastest Route (Dijkstra)',
      time: '1 hr 15 mins',
      distance: '45 km',
    });
  };

  const handleShortestRoute = () => {
    // Simulate backend call for shortest route (A* algorithm)
    setRouteInfo({
      type: 'Shortest Route (A*)',
      time: '1 hr 45 mins',
      distance: '40 km',
    });
  };

  return (
    <div className="map-page-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Route options */}
        <div className="route-buttons">
          <h2>Select Route</h2>
          <button onClick={handleFastestRoute}>Fastest Route (Dijkstra)</button>
          <button onClick={handleShortestRoute}>Shortest Route (A*)</button>
        </div>

        {/* Route Information */}
        <div className="route-info">
          <h2>Route Information</h2>
          <p><strong>Route Type:</strong> {routeInfo.type}</p>
          <p><strong>Total Time:</strong> {routeInfo.time}</p>
          <p><strong>Total Distance:</strong> {routeInfo.distance}</p>
        </div>

        {/* List of Places */}
        <ul className="places-list">
          {places.map((place, index) => (
            <li key={index} className="place-item">
              <h3>{index + 1}. {place.name}</h3>
              <p><strong>Latitude:</strong> {place.lat.toFixed(6)}, <strong>Longitude:</strong> {place.lon.toFixed(6)}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div id="map" className="map"></div>
    </div>
  );
};

export default MapPage;

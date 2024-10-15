import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/MapPage.css';

const MapPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const places = JSON.parse(searchParams.get('places') || '[]');

  const [routeInfo, setRouteInfo] = useState({
    type: 'Not calculated',
    time: 'N/A',
    distance: 'N/A',
  });

  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);

  const initializeMap = useCallback(() => {
    if (!map) {
      const newMap = new window.google.maps.Map(document.getElementById('map'), {
        center: { lat: places[0]?.lat || 0, lng: places[0]?.lon || 0 },
        zoom: 12,
      });
      setMap(newMap);

      const newDirectionsService = new window.google.maps.DirectionsService();
      const newDirectionsRenderer = new window.google.maps.DirectionsRenderer({
        map: newMap,
        suppressMarkers: false, // We'll add our own markers
      });

      setDirectionsService(newDirectionsService);
      setDirectionsRenderer(newDirectionsRenderer);

      // Add markers for each place
      // places.forEach((place, index) => {
      //   // let markerIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // default


      //   new window.google.maps.Marker({
      //     position: { lat: place.lat, lng: place.lon },
      //     map: newMap,
      //     title: place.name,
      //     // icon: markerIcon,
      //   });
      // });
    }
  }, [map, places]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  const displayRoute = useCallback((fullRoute, routeType) => {
    if (directionsService && directionsRenderer) {
      const waypoints = fullRoute.slice(1, -1).map(place => ({
        location: new window.google.maps.LatLng(place.lat, place.lon),
        stopover: true
      }));

      const origin = fullRoute[0];
      const destination = fullRoute[fullRoute.length - 1];

      directionsService.route({
        origin: new window.google.maps.LatLng(origin.lat, origin.lon),
        destination: new window.google.maps.LatLng(destination.lat, destination.lon),
        waypoints: waypoints,
        optimizeWaypoints: false,
        travelMode: 'DRIVING'
      }, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          
          // Calculate total distance and duration
          let totalDistance = 0;
          let totalDuration = 0;
          result.routes[0].legs.forEach((leg) => {
            totalDistance += leg.distance.value;
            totalDuration += leg.duration.value;
          });

          setRouteInfo({
            type: routeType,
            time: `${Math.floor(totalDuration / 3600)} hr ${Math.floor((totalDuration % 3600) / 60)} mins`,
            distance: `${(totalDistance / 1000).toFixed(2)} km`,
          });
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
    }
  }, [directionsService, directionsRenderer]);

  const handleFastestRoute = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/dijkstra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(places),
      });
      const data = await response.json();
      displayRoute(data.route, 'Dijkstra Route');
    } catch (error) {
      console.error('Error fetching Dijkstra Route:', error);
    }
  }, [places, displayRoute]);

  const handleShortestRoute = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/astar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(places),
      });
      const data = await response.json();
      displayRoute(data.full_route, 'A* Route');
    } catch (error) {
      console.error('Error fetching A* Route:', error);
    }
  }, [places, displayRoute]);

  return (
    <div className="map-page-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Route options */}
        <div className="route-buttons">
          <h2>Select Route</h2>
          <button onClick={handleFastestRoute}>Dijkstra Route</button>
          <button onClick={handleShortestRoute}>A* Route</button>
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
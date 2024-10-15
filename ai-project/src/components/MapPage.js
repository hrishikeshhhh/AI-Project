import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/MapPage.css';
import Loader from './Loader';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
  const [updatedPlaces, setUpdatedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);


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
    setLoading(true);
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
      setUpdatedPlaces(data.route);
    } catch (error) {
      console.error('Error fetching Dijkstra Route:', error);
    } finally {
      setLoading(false);
    }
  }, [places, displayRoute]);

  const handleShortestRoute = useCallback(async () => {
    setLoading(true);
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
      setUpdatedPlaces(data.full_route);
    } catch (error) {
      console.error('Error fetching A* Route:', error);
    } finally {
      setLoading(false);
    }
  }, [places, displayRoute]);

  const Timeline = ({ places }) => (
    <div className="timeline">
      {/* Start marker */}
      <div className="timeline-item">
        <div className="timeline-content start-end">
          <h3>START</h3>
        </div>
      </div>
  
      {/* Main timeline stops */}
      {places.map((place, index) => (
        <div key={index} className="timeline-item">
          <div className="timeline-content">
            <h3>{place.name}</h3>
          </div>
        </div>
      ))}
  
      {/* End marker */}
      <div className="timeline-item">
        <div className="timeline-content start-end">
          <h3>END</h3>
        </div>
      </div>
    </div>
  );  

  return (
    <div className="map-page-container">
      {/* Loader */}
      {loading && <Loader />}

      {/* Sidebar */}
      <div className="sidebar">
        {/* Route options */}
        <div className="route-buttons">
          <h2>Select Route</h2>
          <div className='route-buttons-container'>
            <button onClick={handleFastestRoute}>
              <i className="fas fa-tachometer-alt"></i> Dijkstra Route
            </button>
            <button onClick={handleShortestRoute}>
              <i className="fas fa-location-arrow"></i> A* Route
            </button>
          </div>
        </div>

        {/* Route Information */}
        <div className="route-info">
          <h2>Route Information</h2>
          <p className="route-type"><i className="fas fa-route"></i> <strong>Route Type:</strong> {routeInfo.type}</p>
          <p className="route-time"><i className="far fa-clock"></i> <strong>Total Time:</strong> {routeInfo.time}</p>
          <p className="route-distance"><i className="fas fa-road"></i> <strong>Total Distance:</strong> {routeInfo.distance}</p>
        </div>

        {/* Timeline */}
        <Timeline places={updatedPlaces.length > 0 ? updatedPlaces : places} />
      </div>

      {/* Map */}
      <div id="map" className="map"></div>
    </div>
  );
};

export default MapPage;
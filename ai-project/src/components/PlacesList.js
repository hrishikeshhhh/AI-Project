import React from 'react';

const PlacesList = ({ places, onAddPlace }) => {
  return (
    <div className="places-section">
      <h2>Famous Places </h2>
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
            <button onClick={() => onAddPlace(place)}>Add to Itinerary</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlacesList;

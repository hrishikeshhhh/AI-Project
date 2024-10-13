import React from 'react';

const Popup = ({ selectedPlaces, onRemovePlace, onGoToMap }) => {
  return (
    <div className="popup">
      <h2>Your Itinerary</h2>
      <div className="popup-list">
        <ul>
          {selectedPlaces.map((place, index) => (
            <li key={index}>
              {place.name}
              <button onClick={() => onRemovePlace(place)}>
                <span className="material-icons">delete</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button className="map-button" onClick={onGoToMap}>
        Go to Map
      </button>
    </div>
  );
};

export default Popup;

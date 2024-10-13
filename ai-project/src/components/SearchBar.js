import React from 'react';

const SearchBar = ({ city, onCityChange, onSearch, onKeyDown }) => {
  return (
      <div className = 'search-secton'> 
        <h1>Which place would you like to explore?</h1>
        <div className='search-bar'>
          {/* City Input */}
          <input 
            type="text" 
            value={city} 
            onChange={onCityChange}
            onKeyDown={onKeyDown}
            placeholder="Enter a city"
          />
          <button onClick={onSearch}>
            <span className="material-icons">search</span>
          </button>
        </div>
      </div>
  );
};

export default SearchBar;
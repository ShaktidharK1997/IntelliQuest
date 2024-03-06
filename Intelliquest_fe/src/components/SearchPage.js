import React, { useState } from 'react';
import './SearchPage.css';


function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [expandedAbstract, setExpandedAbstract] = useState(null); 

  const handleSearch = async () => {
    // Replace with your Django API endpoint
    const apiUrl = `http://127.0.0.1:8000/IntelliQuest_v1/search/?query=${query}`;
    console.log(apiUrl);
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setResults(data.results);
      console.log(data.results);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const toggleAbstract = (index) => {
    setExpandedAbstract(expandedAbstract === index ? null : index);
  };

  return (
    <>
      <div className = "header">
        <a href="{% url 'home' %}" class="logo">IntelliQuest</a>
      </div>
      <div className="header-right">
        <button onClick={() => window.location='#signin'}>Sign In</button>
        <button onClick={() => window.location='#settings'}>Settings</button>
      </div>

      <div className='search-container'>
        <input className='search-input'
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search papers..."
        />
        <button className='search-button' onClick={handleSearch}>Search</button>
        
        <div className="results-container"> 
          {results.length > 0 ? (
            results.map((paper, index) => (
              <div key={index} className="paper">
                <h4>{paper.title}</h4>
                {expandedAbstract === index ? (
                  <p>{paper.abstract} <button onClick={() => toggleAbstract(index)}>Read less</button></p>
                ) : (
                  <p>{paper.abstract.substring(0, 100)}... <button onClick={() => toggleAbstract(index)}>Read more</button></p>
                )}
                <p>Authors: {paper.authors.join(', ')}</p>
              </div>
            ))
          ) : (
            <p>One Stop portal for searching anything academic!</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
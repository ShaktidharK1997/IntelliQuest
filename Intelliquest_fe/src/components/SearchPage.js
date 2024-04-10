import React, { useState } from 'react';
import './SearchPage.css';
import { useNavigate } from 'react-router-dom';
import Logo from '../logo.svg';
import CenterLogo from '../center_logo.svg';
import { useAuth } from '../contexts/AuthContext';



function SearchPage() {
  const { currentUser, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [authorName, setAuthorName] = useState('');

  // Link to signin page
  let navigate = useNavigate();
  const handleSignInClick = () => {
    navigate('/signin'); // Navigate to the sign-in page
  };

  const handleSearch = async () => {
    // Replace with your Django API endpoint
    const apiUrl = `http://127.0.0.1:8000/IntelliQuest_v1/search/?query=${query}`;
    console.log(apiUrl);
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setResults(data.results);
      console.log(data.results);
      const filteredResults = data.results.filter((paper) => {
        const year = parseInt(paper.year);
        const from = yearFrom ? parseInt(yearFrom) : -Infinity;
        const to = yearTo ? parseInt(yearTo) : Infinity;
        const authorMatch = authorName ? paper.authors.some(author => author.toLowerCase().includes(authorName.toLowerCase())) : true;
        return year >= from && year <= to && authorMatch;
      });
      setResults(filteredResults);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  function resetSearch() {
    setQuery(''); // Resets the query string
    setResults([]); // Resets the search results
    setShowAdvancedSearch(false);
    setYearFrom('');
    setYearTo('');
  }

  const clearFilters = () => {
    setYearFrom('');
    setYearTo('');
    setAuthorName('');
  };

  const toggleAbstract = (index) => {
    setExpandedAbstract(expandedAbstract === index ? null : index);
  };

  const renderAbstract = (paper, index) => {
    const abstractText = paper.abstract || "Abstract not available";
    return expandedAbstract === index ? (
      <p>{abstractText} <button className="readmore" onClick={() => toggleAbstract(index)}>Read less</button></p>
    ) : (
      <p>{abstractText.substring(0, 100)}... <button className="readmore" onClick={() => toggleAbstract(index)}>Read more</button></p>
    );
  };

  return (
    <>
      <div className="header">
        <div className="logo" onClick={resetSearch} style={{cursor: 'pointer'}}>
          <img src={Logo} alt="IntelliQuest Logo" />
        </div>
      </div>
      <div className="header-right">
      {currentUser ? (
        <>
          <span>{`User ID: ${currentUser.id}`}</span>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={handleSignInClick}>Sign In</button>
      )}
        <button onClick={() => window.location='#settings'}>Settings</button>
      </div>

      <div className='search-container'>
        <div className="center-logo-container" onClick={resetSearch} style={{cursor: 'pointer'}}>
          <img src={CenterLogo} alt="Center Logo" className="center-logo" />
          <h1>IntelliQuest</h1>
        </div>

        <input className='search-input'
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search papers..."
        />
        <div className="buttons-container">
          <button className='search-button' onClick={handleSearch}>Search</button>
          <button className='advanced-search-button' onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
            Advanced
          </button>
        </div>
        {showAdvancedSearch && (
          <div className="advanced-search-options">
            <div className="year-range-inputs">
                <input
                    className='year-input'
                    type="number"
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    placeholder="Year from..."
                />
                <input
                    className='year-input'
                    type="number"
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    placeholder="Year to..."
                />
            </div>
            <input
            className='author-input'
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Author's Name"
            />
          </div>
        )}

        <div className="filter-actions">
            {showAdvancedSearch && (
              <span className="clear-filters" onClick={clearFilters}>Clear filters</span>
            )}
        </div>
        
        
        <div className="results-container"> 
          {results.length > 0 ? (
            results.map((paper, index) => (
              <div key={index} className="paper">
                <h4>{paper.title}</h4>
                {renderAbstract(paper, index)}
                <p>Authors: {paper.authors.join(', ')}</p>
                <p>Year : {paper.year}</p>
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
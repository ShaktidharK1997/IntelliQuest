import React, { useState, useEffect } from 'react';
import './SearchPage.css';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../logo.svg';
import CenterLogo from '../center_logo.svg';
import { useAuth } from '../contexts/AuthContext'; // Ensure this import is correct
import { useSearchResults } from '../SearchResultsContext'; // Adjust the path as necessary

function SearchPage() {
  const { authState } = useAuth();
  const { signOut } = useAuth(); // Ensure this import is correct
  console.log(authState.user);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [authorName, setAuthorName] = useState('');
  const { query, setQuery, results, setResults } = useSearchResults();
  const [expandedAbstract, setExpandedAbstract] = useState(null); 
  const [recentSearches, setRecentSearches] = useState([]);

  let navigate = useNavigate();

  useEffect(() => {
    if (authState.user) {
      const savedSearches = JSON.parse(localStorage.getItem(`recentSearches_${authState.user}`)); // Use user.id
      if (savedSearches) {
        setRecentSearches(savedSearches);
      }
    }
  }, [authState.user]);

  const handleSearch = async () => {
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
      
      // Update recent searches
      setRecentSearches(prevSearches => {
        const updatedSearches = [query, ...prevSearches.filter(q => q !== query)].slice(0, 5);
        if (authState.user) {
          localStorage.setItem(`recentSearches_${authState.user}`, JSON.stringify(updatedSearches));
        }
        return updatedSearches;
      });

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  function resetSearch() {
    setQuery('');
    setResults([]);
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
        {authState.user ? (
          <>
            <span>{`User ID: ${authState.user}`}</span>
            <button onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <button onClick={() => navigate('/signin')}>Sign In</button>
        )}
        <button onClick={() => navigate('/myprofile')}>My Profile</button>
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
        
        
        <div className="recent-searches"> {/* Display recent searches */}
        <h3>Recent Searches:</h3>
          {recentSearches.map((search, index) => (
            <button key={index} onClick={() => setQuery(search) || handleSearch()}>
              {search}
            </button>
          ))}
        </div>
        
        <div className="results-container"> 
          {results.length > 0 ? (
            results.map((paper, index) => (
              <div key={index} className="paper">
                <h4>
                <Link to={`/PaperDetail?paperid=${paper.paperID}`} style={{ color: 'blue', textDecoration: 'none' }}>
                {paper.title}
                </Link>

                </h4>
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
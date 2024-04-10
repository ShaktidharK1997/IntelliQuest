import React, { createContext, useContext, useState } from 'react';

// Create context
const SearchResultsContext = createContext();

// Export a hook to use the context
export const useSearchResults = () => useContext(SearchResultsContext);

// Provider component
export const SearchResultsProvider = ({ children }) => {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');

  const value = {
    results,
    setResults,
    query,
    setQuery,
  };

  return (
    <SearchResultsContext.Provider value={value}>
      {children}
    </SearchResultsContext.Provider>
  );
};

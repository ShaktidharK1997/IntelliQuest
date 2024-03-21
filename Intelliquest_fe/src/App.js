import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchPage from './components/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Define the route for SearchPage */}
          <Route path="/" element={<SearchPage />} />
          {/* You can add more Route components here for other pages */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignInPage from './components/SignInPage';
import SearchPage from './components/SearchPage';
import SignUpPage from './components/SignUpPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Define the route for SearchPage */}
          <Route path="/" element={<SearchPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* You can add more Route components here for other pages */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

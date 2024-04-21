import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignInPage from './components/SignInPage';
import SearchPage from './components/SearchPage';
import SignUpPage from './components/SignUpPage';
import PaperDetail from './components/PaperDetail';
import { SearchResultsProvider } from './SearchResultsContext';
import ProfileLayout from './components/ProfileLayout';
import PersonalInfo from './components/PersonalInfo';
import Education from './components/Education';
import Experience from './components/Experience';
import Publications from './components/Publications';
import { AuthProvider, useAuth } from './contexts/AuthContext';  // Ensure AuthContext is correctly exported from the contexts file

function PrivateRoute({ children }) {
  const { user } = useAuth();  // useAuth now directly provides the user object
  return user ? children : <Navigate to="/signin" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>  {/* Wrap all routes inside AuthProvider */}
        <SearchResultsProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<SearchPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/paperdetail" element={<PaperDetail />} />
              {/* You can add more Route components here for other pages */}
            </Routes>
          </div>
          <div className="Profile">
            <Routes>
              <Route path="/myprofile/*" element={
                <PrivateRoute>  {/* Replaced isAuthenticated check with PrivateRoute */}
                  <ProfileLayout>
                    <Routes>  {/* Nested Routes inside ProfileLayout */}
                      <Route index element={<PersonalInfo />} />
                      <Route path="personalinfo" element={<PersonalInfo />} />
                      <Route path="education" element={<Education />} />
                      <Route path="experience" element={<Experience />} />
                      <Route path="publications" element={<Publications />} />
                      {/* Additional nested routes can be configured here */}
                    </Routes>
                  </ProfileLayout>
                </PrivateRoute>
              }/>
              {/* You can add other routes here not using ProfileLayout */}
            </Routes>
          </div>
        </SearchResultsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

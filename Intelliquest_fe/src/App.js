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
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();  // useAuth now directly provides the user object
  return user ? children : <Navigate to="/signin" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchResultsProvider>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/paperdetail/:id" element={<PaperDetail />} />
            <Route path="/myprofile/*" element={<PrivateRoute><ProfileLayout /></PrivateRoute>}>
              <Route index element={<Navigate to="personalinfo" replace />} />
              <Route path="personalinfo" element={<PersonalInfo />} />
              <Route path="education" element={<Education />} />
              <Route path="experience" element={<Experience />} />
              <Route path="publications" element={<Publications />} />
            </Route>
          </Routes>
        </SearchResultsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

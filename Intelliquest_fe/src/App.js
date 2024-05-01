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
import Bookmarks from './components/Bookmarks';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchResultsProvider>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/paperdetail/" element={<PaperDetail />} />
            <Route path="/myprofile/*" element={
                        <ProfileLayout>
                            <Routes>  {/* Nested Routes inside ProfileLayout */}
                                <Route index element={<PersonalInfo />} />
                                <Route path="personalinfo" element={<PersonalInfo />} />
                                <Route path="education" element={<Education />} />
                                <Route path="publications" element={<Publications />} />
                                <Route path="experience" element={<Experience />} />
                                <Route path="bookmarks" element={<Bookmarks />} />
                                {/* Additional nested routes can be configured here */}
                                {/* <Route path="experience" element={<Experience />} />
                                <Route path="published-articles" element={<Publications />} /> */}
                            </Routes>
                        </ProfileLayout>
                    }>
              </Route>
          </Routes>
        </SearchResultsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
// These are the changes where div tag is in the develop 
// <div className="App">
// <Routes>
// {/* Define the route for SearchPage */}
// <Route path="/" element={<SearchPage />} />
// <Route path="/signin" element={<SignInPage />} />
// <Route path="/signup" element={<SignUpPage />} />
// <Route path="/paperdetail" element={<PaperDetail />} />
// {/* You can add more Route components here for other pages */}
// </Routes>
// </div>
export default App;
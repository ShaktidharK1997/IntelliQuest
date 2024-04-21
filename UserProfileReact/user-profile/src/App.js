import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProfileLayout from './components/ProfileLayout';
import PersonalInfo from './components/PersonalInfo';
import Education from './components/Education';

// Import Experience and Publications if they are uncommented later
// import Experience from './components/Experience';
// import Publications from './components/Publications';

function App() {
    return (
        <Router>
            <div className="Profile">
                <Routes>
                    <Route path="/myprofile/*" element={
                        <ProfileLayout>
                            <Routes>  {/* Nested Routes inside ProfileLayout */}
                                <Route index element={<PersonalInfo />} />
                                <Route path="personalinfo" element={<PersonalInfo />} />
                                <Route path="education" element={<Education />} />
                                {/* Additional nested routes can be configured here */}
                                {/* <Route path="experience" element={<Experience />} />
                                <Route path="published-articles" element={<Publications />} /> */}
                            </Routes>
                        </ProfileLayout>
                    }>
                    </Route>
                    {/* You can add other routes here not using ProfileLayout */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;

// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/SideBar';
import PersonalInfo from './components/PersonalInfo';
import Education from './components/Education';
import Header from './components/Header';

// import Experience from './components/Experience';
// import PublishedArticles from './components/Publications';
import './App.css'; // Main App CSS file


function App() {
  return (
    <Router>
      <div className="App">
        <div className="header">
        <Header />
        </div>
   
        <div className="sidebar">
         <Sidebar />
        </div>

        <div className="content">
          <Routes>
            <Route path="api/personalinfo" element={<PersonalInfo />} />
            <Route path="api/education" element={<Education />} />

            {/* <Route path="/experience" element={<Experience />} />
            <Route path="/published-articles" element={<Publications />} /> */}
            {/* <Route path="/" element={<PersonalInfo />} /> Default Route */}
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;

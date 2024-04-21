import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

// Get the element where you want to mount your React application
const container = document.getElementById('root');

// Create a root
const root = createRoot(container);

// Render your app component into the root
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

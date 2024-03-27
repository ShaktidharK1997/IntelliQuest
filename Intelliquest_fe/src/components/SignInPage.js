import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


import './SignInPage.css'; // Make sure to import the CSS file

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  let navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/IntelliQuest_v1/signin/', { // Make sure this URL matches your Django sign-in endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Sign in successful', data);
        localStorage.setItem('token', data.token); // Assuming the response includes a token
        signIn({ id: email, email: email });
        navigate('/'); // Redirect to the dashboard or appropriate page
      } else {
        console.error('Failed to sign in');
        // Handle errors, e.g., show a message to the user
      }
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };
  

  return (
    <div className="signin-container">
      <form onSubmit={handleSignIn} className="signin-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <p>Do not have an account? <button onClick={() => navigate('/signup')} className="link-button">Register an account.</button></p>
        <button type="submit" className="signin-button">Login</button>
      </form>
    </div>
  );
}

export default SignInPage;

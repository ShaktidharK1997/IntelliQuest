import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import './SignUpPage.css'; // Ensure you import the CSS stylesheet

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    // Your sign-up logic here (e.g., API call to your backend server)
    console.log('Signing up:', email, password);
    // navigate('/dashboard'); // Redirect on successful sign-up
  };

  const responseGoogle = (response) => {
    console.log(response);
    // Handle Google sign-up/login response here
    // Redirect or perform actions based on Google auth response
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignUp} className="signup-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="signup-input" // Apply class for styling
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="signup-input" // Apply class for styling
        />
        <p className="password-instructions">
          Password must be at least 8 characters long and should not be too common.
        </p>
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
      <GoogleLogin
        clientId="your_client_id_here.apps.googleusercontent.com" // Replace with your Google client ID
        buttonText="Sign Up with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
        className="google-login-button" // Apply class for styling
      />
    </div>
  );
}

export default SignUpPage;

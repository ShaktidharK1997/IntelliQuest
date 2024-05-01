import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { GoogleLogin } from 'react-google-login';
import './SignUpPage.css'; // Ensure you import the CSS stylesheet

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Add an error state
  let navigate = useNavigate();
  const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
  const api_url = `${base_url}/IntelliQuest_v1/signup/`;

  const isValidEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email); // Simple regex for email validation
  };

  const isValidPassword = (password) => {
    return password.length >= 8; // Checks if password is at least 8 characters
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); // Reset error message

    // Static checks for email and password validity
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log('Signing up:', email, password);
        navigate('/signin'); // Navigate to sign-in page on success
      } else {
        console.error('Failed to sign up');
        setError('Failed to sign up. Please try again.');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      setError('An error occurred during sign up. Please try again.');
    }
  };

/*   const responseGoogle = (response) => {
    console.log(response);
    // Implement Google sign-up/login logic here
  }; */

  return (
    <div className="signup-container">
      <form onSubmit={handleSignUp} className="signup-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="signup-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="signup-input"
        />
        <p className="password-instructions">
          Password must be at least 8 characters long and should not be too common.
        </p>
        {error && <div className="error-message">{error}</div>} {/* Display error message if any */}
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
{/*       <GoogleLogin
        clientId="454933535483-apt2pd791htjnfdvdmt1mui3psskai96.apps.googleusercontent.com"
        buttonText="Sign Up with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
        className="google-login-button"

       /> */}
      <button onClick={() => navigate('/signin')} className="signup-back-button">Back to Login</button>

    </div>
  );
}

export default SignUpPage;

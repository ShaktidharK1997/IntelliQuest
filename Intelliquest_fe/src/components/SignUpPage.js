import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import { GoogleLogin } from 'react-google-login';
import Logo from '../center_logo.svg';
import './SignUpPage.css'; // Ensure you import the CSS stylesheet

function SignUpPage() {
  const [fullName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Add an error state
  let navigate = useNavigate();


  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!fullName) {
      setError('Please enter your full name.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/IntelliQuest_v1/signup/', {
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
        setError('Failed to sign up. Please try again.');
      }
    } catch (error) {
      setError('An error occurred during sign up. Please try again.');
    }
  };

/*   const responseGoogle = (response) => {
    console.log(response);
    // Implement Google sign-up/login logic here
  }; */

  return (
    <div className="signup-container">
      <div className="signin-header">
        <img src={Logo} alt="IntelliQuestLogo" className="signin-logo" />
        <h1>IntelliQuest</h1>
      </div>
      <form onSubmit={handleSignUp} className="signup-form">
        <h2>Create Your Account</h2>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Full Name"
          required
          className="signup-input"
        />
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
          Note: Password must be at least 8 characters long
        </p>
        {error && <div className="error-message">{error}</div>} {/* Display error message if any */}
        <button type="submit" className="signup-button">Sign Up</button>
        <button onClick={() => navigate('/signin')} className="signup-back-button">Back to Login</button>
      </form>
{/*       <GoogleLogin
        clientId="454933535483-apt2pd791htjnfdvdmt1mui3psskai96.apps.googleusercontent.com"
        buttonText="Sign Up with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
        className="google-login-button"

       /> */}
      

    </div>
  );
}

export default SignUpPage;

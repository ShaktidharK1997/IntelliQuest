import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Add other state variables as needed
  let navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    // Implement sign-up logic here
  };

  const responseGoogle = (response) => {
    // Handle the response from Google after login attempt
    console.log(response);
    // You can redirect the user after successful login or handle errors
  };


  return (
    <div className="signup-container">
      <form onSubmit={handleSignUp}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <p>Password must be at least 8 characters long and should not be too common.</p>
        <button type="submit">Sign Up</button>
      </form>
      <GoogleLogin
        clientId="YOUR_CLIENT_ID.apps.googleusercontent.com"
        buttonText="Sign Up with Google"
        onSuccess={responseGoogle}
        onFailure={responseGoogle}
        cookiePolicy={'single_host_origin'}
      />
    </div>
    
  );
}

export default SignUpPage;
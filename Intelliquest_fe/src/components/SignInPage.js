import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignInPage.css';
import Logo from '../center_logo.svg'; 
function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);  // State to manage loading during API call
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const isValidEmail = email => /\S+@\S+\.\S+/.test(email);  // Simple email validation

    const handleSignIn = async (e) => {
      e.preventDefault();
      if (!isValidEmail(email)) {
          setError('Please enter a valid email.');
          return;
      }
      setIsLoading(true);
      try {
          await signIn({ email, password });
          navigate('/');
      } catch (err) {
          // Ensure that error is an instance of Error
          console.log("Error fetching")
          const message = err instanceof Error ? err.message : 'An unexpected error occurred';
          setError(message);
      } finally {
          setIsLoading(false);
      }
  };
  

  return (
    <div className="signin-container">
      <div className="signin-header">
        <img src={Logo} alt="IntelliQuest Logo" className="signin-logo" />
        <h1>IntelliQuest</h1>
      </div>
      <form onSubmit={handleSignIn} className="signin-form">
        <h2>Login</h2>
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
        <p>Don't have an account? <button onClick={() => navigate('/signup')} className="link-button">Create an account.</button></p>
        <button type="submit" className="signin-button">Login</button>
        <button onClick={() => navigate('/')} className="signup-back-button">Back to Search Page</button>
      </form>
    </div>
  );
}

export default SignInPage;

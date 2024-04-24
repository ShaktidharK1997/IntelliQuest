import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignInPage.css';

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
            <form onSubmit={handleSignIn} className="signin-form">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="signin-input"
                    aria-label="Email"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="signin-input"
                    aria-label="Password"
                />
                {error && <div className="signin-error">{error}</div>}
                <button type="submit" className="signin-button" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p>Do not have an account? <button onClick={() => navigate('/signup')} className="link-button">Register now.</button></p>
        </div>
    );
}

export default SignInPage;

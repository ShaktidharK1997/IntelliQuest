import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const response = await fetch('http://127.0.0.1:8000/IntelliQuest_v1/signin/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Sign in successful', data);
      // Redirect or do something upon successful sign in
    } else {
      console.error('Failed to sign in');
    }
  };

  return (
    <div className="signin-container">
      <form onSubmit={handleSignIn}>
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
        <p>Do not have an account? Register an account.</p>
        <button type="submit">Sign In</button>
        <button onClick={() => navigate('/signup')}>Sign Up</button>
      </form>
    </div>
  );
}

export default SignInPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpPage.css';

function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    let navigate = useNavigate();

    const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const isValidPassword = (password) => password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        if (!isValidPassword(password)) {
            setError('Password must be at least 8 characters long and include both letters and numbers.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/signup/', { // ensure this matches the exact endpoint expected by the server
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });
            const data = await response.json();
            if (response.ok) {
                navigate('/signin');  // Navigate to sign-in page on successful signup
            } else {
                setError(data.message || 'Failed to sign up. Please try again.');  // Use backend-provided error message if available
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            setError('Network error, please try again later.');
        }
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
                    Password must be at least 8 characters long, include letters and numbers, and should not be too common.
                </p>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="signup-button">Sign Up</button>
            </form>
        </div>
    );
}

export default SignUpPage;

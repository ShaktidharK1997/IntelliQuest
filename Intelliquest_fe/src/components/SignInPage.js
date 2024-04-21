import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignInPage.css';

function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useAuth();  // Correctly pulling signIn from useAuth
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            await signIn({ email, password });
            navigate('/');  // Redirect to home on success
        } catch (error) {
            setError(error.message);
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
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="signin-input"
                />
                {error && <div className="signin-error">{error}</div>}
                <button type="submit" className="signin-button">Login</button>
            </form>
            <p>Do not have an account? <button onClick={() => navigate('/signup')} className="link-button">Register now.</button></p>
        </div>
    );
}

export default SignInPage;

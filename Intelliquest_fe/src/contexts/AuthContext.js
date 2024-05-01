import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
const api_url = `${base_url}/IntelliQuest_v1/signin/`;

const safeJSONParse = (str, defaultValue = null) => {
    try {
        return JSON.parse(str) || defaultValue;
    } catch (e) {
        console.log("Parsing error: ", e);
        return defaultValue;
    }
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: safeJSONParse(localStorage.getItem('user'), {}),
        tokens: safeJSONParse(localStorage.getItem('tokens'), {}),
    });

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(authState.user || {}));
        localStorage.setItem('tokens', JSON.stringify(authState.tokens || {}));
    }, [authState]);

    const signIn = async ({ email, password }) => {
        try {
            const response = await fetch(api_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to sign in');
            }
            const data = await response.json();
            console.log(data);
            setAuthState({
                user: data.email, // this should be the email from the response
                tokens: {
                    access: data.access, // the access token
                    refresh: data.refresh // the refresh token
                }
            });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const signOut = () => {
        setAuthState({ user: null, tokens: null });
        localStorage.removeItem('user');
        localStorage.removeItem('tokens');
    };

    return (
        <AuthContext.Provider value={{ authState, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

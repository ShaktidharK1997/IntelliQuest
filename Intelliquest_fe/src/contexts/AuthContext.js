import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

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
            const response = await fetch('http://localhost:8000/signin/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to sign in');
            }
            const data = await response.json();
            setAuthState(prev => ({
                user: {
                    ...prev.user,
                    ...data.user,
                },
                tokens: data.tokens,
            }));
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
        <AuthContext.Provider value={{ ...authState, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

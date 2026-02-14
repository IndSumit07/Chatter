"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = authAPI.getToken();

            if (!token) {
                setLoading(false);
                return;
            }

            // Verify token with backend
            const response = await authAPI.getCurrentUser();

            if (response.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            } else {
                // Token is invalid, clear it
                authAPI.logout();
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            authAPI.logout();
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });

            if (response.success) {
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                setUser(response.data.user);
                setIsAuthenticated(true);

                toast.success('Welcome back!');
                router.push('/dashboard');
                return { success: true };
            } else {
                toast.error(response.message || 'Login failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Something went wrong. Please try again.');
            return { success: false, message: 'Network error' };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);

            if (response.success) {
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                setUser(response.data.user);
                setIsAuthenticated(true);

                toast.success('Account created successfully!');
                router.push('/dashboard');
                return { success: true };
            } else {
                toast.error(response.message || 'Registration failed');
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Register error:', error);
            toast.error('Something went wrong. Please try again.');
            return { success: false, message: 'Network error' };
        }
    };

    const logout = () => {
        authAPI.logout();
        setUser(null);
        setIsAuthenticated(false);
        toast.success('Logged out successfully');
        router.push('/login');
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;

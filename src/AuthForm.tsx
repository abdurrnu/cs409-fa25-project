import React, { useState } from 'react';
import { api, User } from './api';

interface AuthFormProps {
    onLogin: (user: User) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
    // State to toggle between Login and Sign Up view
    const [isLogin, setIsLogin] = useState(true);

    // State to hold form data
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let user: User;
            if (isLogin) {
                // real login: needs email + password
                user = await api.login(email, password);
            } else {
                // sign up / register
                // location is optional for now; we can add a field later if needed
                user = await api.register(email, password, null);
            }
            onLogin(user);
        } catch (err: any) {
            // handleResponse throws an Error with message from backend
            setError(err?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <div className="logo-container">
                    <img src={require('./assets/Illinois_Block_I.png')} alt="UIUC Logo" className="block-i-logo" />
                </div>
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <p>
                    {isLogin ? 'Please enter your details' : 'Create a new account'}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div 
                        className="error-message" 
                        style={{ color: 'red', marginBottom: '10px' }}
                    >
                        {error}
                    </div>
                )}
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="netid@illinois.edu"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                </button>
            </form>

            <div className="auth-switch">
                <p>
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <span 
                        onClick={() => setIsLogin(!isLogin)} 
                        style={{ cursor: 'pointer', color: 'blue', marginLeft: '5px' }}
                    >
                        {isLogin ? ' Sign up' : ' Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

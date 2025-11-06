import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';


export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const nav = useNavigate();  
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(null);
    };
    
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            await login(formData.username, formData.password);
            nav('/'); // Redirects to homepage after successful login
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container auth-form">
            <h2>Login</h2>
            <form onSubmit={submit}>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        className="form-input"
                        name="username"
                        value={formData.username} 
                        onChange={handleChange} 
                        placeholder="Enter your username"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        className="form-input"
                        name="password"
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Enter your password" 
                        type="password"
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{width: '100%'}}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Don't have an account? <Link to="/register">Sign up</Link>
            </p>
        </div>
    )
}
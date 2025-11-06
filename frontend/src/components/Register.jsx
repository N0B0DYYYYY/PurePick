import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthProvider.jsx';
import { Link } from 'react-router-dom';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
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
        
        // Check if passwords match
        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        
        try {
            await register(formData.username, formData.email, formData.password);
            nav('/'); // Redirects to homepage after successful registration
        } catch (err) {
            const errorMsg = err.response?.data;
            if (typeof errorMsg === 'object') {
                const errors = Object.entries(errorMsg)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                setError(errors);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container auth-form">
            <h2>Create Account</h2>
            <form onSubmit={submit}>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        className="form-input"
                        name="username"
                        value={formData.username} 
                        onChange={handleChange} 
                        placeholder="Choose a username"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        className="form-input"
                        name="email"
                        type="email"
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="your@email.com"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        className="form-input"
                        name="password"
                        type="password"
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Create a password"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                        className="form-input"
                        name="password2"
                        type="password"
                        value={formData.password2} 
                        onChange={handleChange} 
                        placeholder="Confirm your password"
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{width: '100%'}}
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </div>
    )
}
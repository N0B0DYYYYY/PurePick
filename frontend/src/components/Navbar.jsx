import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../auth/AuthProvider.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
  }
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-around', background: '#eee', padding: '1rem' }}>
      <Link to="/"><h1 className="navbar-main">PurePick</h1></Link>
      <div className="navbar-links">
        {user ? (
          <div>
            <span className="navbar-username">Hello, {user.username}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
        
      </div>
    </nav>
  );
};

export default Navbar;
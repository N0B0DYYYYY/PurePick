import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          PurePick
        </Link>

        <nav className="navbar-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/" className="nav-link">
            Men
          </Link>
          <Link to="/" className="nav-link">
            Women
          </Link>
          <Link to="/" className="nav-link">
            Sports
          </Link>
          <Link to="/" className="nav-link">
            About
          </Link>
        </nav>
      </div>

      <div className="navbar-right">
        <Link to="/cart" className="nav-link cart-link">
          Cart
        </Link>

        {user ? (
          <div className="user-actions">
            <span className="navbar-username">Hello, {user.username}</span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        ) : (
          <div className="user-actions">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
<h1>Welcome to {process.env.REACT_APP_NAME || 'KOKOKA AI'}</h1>
<p>{process.env.REACT_APP_DESCRIPTION || 'An AI-powered school management tool'}</p>
      </header>
      <nav className="home-nav">
        <Link to="/register-school" className="home-link">Register School</Link>
        <Link to="/login" className="home-link">Login</Link>
      </nav>
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} KOKOKA AI. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;

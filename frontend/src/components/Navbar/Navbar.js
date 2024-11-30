import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; 
import axios from 'axios';

const Navbar = ({ isLoggedIn, setIsLoggedIn, setLogoutMessage, displayName }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Make a request to the backend to log out
            await axios.put('http://localhost:3000/logout', {});

            // Update the frontend state
            setIsLoggedIn(false);  
            setLogoutMessage('You have successfully logged out.'); 
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
            alert('Failed to logout. Please try again.');
        }
    };

    return (
        <nav className="navbar">
            <div className="logo-container">
                <Link className="logo" to="/">Rice Book</Link>
            </div>
            <div className="links-container">
                <ul className="nav-list">
                    {isLoggedIn && (
                        <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/main">Main</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/profile">Profile</Link>
                            </li>
                        </>
                    )}
                </ul>
                <div className="user-actions">
                    {isLoggedIn ? (
                        <>
                            <span className="display-name">{displayName}</span>
                            <button className="logout-button" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <Link className="login-link" to="/">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

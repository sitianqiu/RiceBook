import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import { validateAccountName, validateEmail, validatePhone, validateZipcode, validateDOB } from '../../services/validation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const LandingPage = ({ logoutMessage, setIsLoggedIn, setLoggedInUser }) => {
  const [accountName, setAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);

  const [newUser, setNewUser] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newZipcode, setNewZipcode] = useState('');
  const [newDOB, setNewDOB] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
        const usersData = await axios.get('http://localhost:3000/users', {}, { withCredentials: true });
        setUsers(usersData || []);
    };
    fetchUsers(); 
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:3000/login', { username: accountName, password }, { withCredentials: true });
        setIsLoggedIn(true);
        setLoggedInUser(response.data);
        navigate('/main');
    } catch (error) {
        alert(error.response?.data?.error || 'Login failed. Please try again.');
    }
};

  const handleRegister = async (e) => {
      e.preventDefault();
      let errorMessages = [];
  
      if (!validateAccountName(newUser)) {
          errorMessages.push('Account name must start with a letter and contain only letters or numbers.');
      }
      if (!validateEmail(newEmail)) {
        errorMessages.push('Invalid email address.');
      }
      if (!validatePhone(newPhone)) {
        errorMessages.push('Invalid phone number. It must be exactly 10 digits.');
      }
      if (!validateZipcode(newZipcode)) {
        errorMessages.push('Invalid Zip code. It must be exactly 5 digits.');
      }
      if (!validateDOB(newDOB)) {
        errorMessages.push('You must be at least 18 years old to register.');
      }
      if (newPassword !== confirmPassword) {
        errorMessages.push('Passwords do not match.');
      }
  
      if (errorMessages.length > 0) {
        setMessage(`Registration failed:<br> ${errorMessages.join('<br>')}`);
      } else{
        // If validation passes, send data to the backend
        try {
          const payload = {
              username: newUser,
              email: newEmail,
              phone: newPhone,
              zipcode: newZipcode,
              dob: newDOB,
              password: newPassword,
          };

          const response = await axios.post('http://localhost:3000/register', payload, { withCredentials: true });

          // Handle successful registration
          setMessage(`Registration successful for ${response.data.username}!`);
          setLoggedInUser(response.data);
          setIsLoggedIn(true);
          navigate('/main');
        } catch (error) {
            // Handle backend errors
            setMessage(`Registration failed: ${error.response?.data?.error || 'Please try again.'}`);
        }
      }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
      console.log('Google login succeeded, received credentialResponse:', credentialResponse);
      try {
        const { credential } = credentialResponse;
        console.log('Sending credential to backend:', credential);
        const response = await axios.post(
          'http://localhost:3000/google',
          { token: credential },
          { withCredentials: true }
        );
  
        setIsLoggedIn(true);
        setLoggedInUser(response.data);
        navigate('/main')
      } catch (error) {
        console.error('Google login failed:', error);
        alert('Google login failed. Please try again.');
      }
    };
  
    const handleGoogleFailure = () => {
      alert('Google login failed. Please try again.');
    };

    useEffect(() => {
        console.log('Frontend Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
    }, []);

    return (
        <div className="container">
        {logoutMessage && <p className="logout-message">{logoutMessage}</p>}
        <h2>Welcome Back!</h2>

        <div className="login-form">
            <h3>Login</h3>
            <form onSubmit={handleLogin}>
            <div className="form-group">
                <label>Account Name</label>
                <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="form-control"
                placeholder="Enter account name"
                data-testid="login-account-name"
                />
            </div>
            <div className="form-group">
                <label>Password</label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter password"
                />
            </div>
            <button type="submit" className="btn btn-primary">Login</button>
            </form>

            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
            <div>
              <h2>Login with Google</h2>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
              />
            </div>
          </GoogleOAuthProvider>

        </div>

        <div className="registration-form">
        <h3>Register</h3>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>New Account Name</label>
            <input
              type="text"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              className="form-control"
              placeholder="Enter new account name"
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="form-control"
              placeholder="Enter email address"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="form-control"
              placeholder="Enter phone number"
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              value={newZipcode}
              onChange={(e) => setNewZipcode(e.target.value)}
              className="form-control"
              placeholder="Enter zip code"
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={newDOB}
              onChange={(e) => setNewDOB(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-control"
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              placeholder="Confirm new password"
            />
          </div>
          <div id="message" dangerouslySetInnerHTML={{ __html: message }}></div>
          <button type="submit" className="btn btn-secondary">Register</button>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;

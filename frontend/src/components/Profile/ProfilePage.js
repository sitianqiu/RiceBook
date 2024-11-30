import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { validateEmail, validatePhone, validateZipcode } from '../../services/validation';

const ProfilePage = ({ updateUser, loggedInUser }) => {
  const [newEmail, setNewEmail] = useState(loggedInUser.email || '');
  const [newPhone, setNewPhone] = useState(loggedInUser.phone || '');
  const [newZipcode, setNewZipcode] = useState(loggedInUser.address?.zipcode || ''); 
  const [newPassword, setNewPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(loggedInUser.profilePicture || '/profile.jpeg');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
      setMessage('Profile picture selected, but no update action yet.');
    }
  };

  const handleUpdate = () => {
    let changes = [];
    let errorMessages = [];

    if (newEmail && newEmail !== loggedInUser.email) {
      if (validateEmail(newEmail)) {
        changes.push(`Email updated from ${loggedInUser.email} to ${newEmail}`);
        updateUser({ ...loggedInUser, email: newEmail });
      } else {
        errorMessages.push('Invalid email address.');
      }
    }

    // Check Phone
    if (newPhone && newPhone !== loggedInUser.phone) {
      if (validatePhone(newPhone)) {
        changes.push(`Phone updated from ${loggedInUser.phone} to ${newPhone}`);
        updateUser({ ...loggedInUser, phone: newPhone });
      } else {
        errorMessages.push('Invalid phone number. Must be exactly 10 digits.');
      }
    }

    // Check Zipcode
    if (newZipcode && newZipcode !== loggedInUser.address?.zipcode) {
      if (validateZipcode(newZipcode)) {
        changes.push(`Zipcode updated from ${loggedInUser.address?.zipcode} to ${newZipcode}`);
        updateUser({ ...loggedInUser, address: { ...loggedInUser.address, zipcode: newZipcode } });
      } else {
        errorMessages.push('Invalid zip code. Must be exactly 5 digits.');
      }
    }

    // Check Password
    if (newPassword) {
      if (newPassword === confirmPassword) {
        changes.push('Password updated.');
      } else {
        errorMessages.push('Passwords do not match.');
      }
    }

    // Handle errors or success
    if (errorMessages.length > 0) {
      setErrors(errorMessages);
    } else if (changes.length > 0) {
      setMessage(`Profile updated: ${changes.join(' | ')}`);
    } else {
      setMessage('No changes made.');
    }
  };

  const handleBackToMain = () => {
    navigate('/main'); 
  };

  return (
    <div className="profile-container">
      <h2>{loggedInUser.username}'s Profile</h2>

      <div className="profile-section">
        <div className="profile-picture">
          <img src={profilePicture || '/profile.jpeg'} alt="Profile" />
        </div>

        <br />

        <div className="form-group">
          <label>Upload New Profile Picture</label>
          <input type="file" onChange={handleProfilePictureChange} />
        </div>
      </div>

      {/* Display Errors */}
      {errors.length > 0 && (
        <div id="error-messages">
          {errors.map((error, index) => (
            <p key={index} className="error-text">{error}</p>
          ))}
        </div>
      )}

      {/* Display Success Message */}
      {message && <div id="message">{message}</div>}

      {/* Original Email and Input */}
      <div className="form-group">
        <label>Email Address (Current: {loggedInUser.email})</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter new email address"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
      </div>

      {/* Original Phone and Input */}
      <div className="form-group">
        <label>Phone Number (Current: {loggedInUser.phone})</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter new phone number"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
        />
      </div>

      {/* Original Zipcode and Input */}
      <div className="form-group">
        <label>Zipcode (Current: {loggedInUser.address?.zipcode})</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter new zipcode"
          value={newZipcode}
          onChange={(e) => setNewZipcode(e.target.value)}
        />
      </div>

      {/* New Password fields */}
      <div className="form-group">
        <label>Password (Current: {'*'.repeat(loggedInUser.address.street.length)})</label> 
        <input
          type="password"
          className="form-control"
          placeholder="Enter new password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} 
        />
      </div>

      {newPassword && (
        <div className="form-group">
          <label>Confirm Password</label> 
          <input
            type="password"
            className="form-control"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      )}

      <div className="button-group">
        <button className="btn btn-primary" onClick={handleUpdate}>Update Profile</button>
        <button className="btn btn-secondary" onClick={handleBackToMain}>Back to Main Page</button>
      </div>
    </div>
  );
};

export default ProfilePage;

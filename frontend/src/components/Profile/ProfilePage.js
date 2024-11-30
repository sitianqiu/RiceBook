import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { validateEmail, validatePhone, validateZipcode, validateDOB } from '../../services/validation';
import axios from 'axios';

const ProfilePage = ({ updateUser, loggedInUser }) => {
  const [profileData, setProfileData] = useState(null);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newZipcode, setNewZipcode] = useState('');
  const [newDOB, setNewDOB] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('/profile.jpeg');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch profile data from the API
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3000/profile', {
          withCredentials: true, // Send cookies for authentication
        });
        const data = response.data;

        // Set the fetched profile data
        setProfileData(data);
        setNewEmail(data.email || '');
        setNewPhone(data.phone || '');
        setNewZipcode(data.zipcode || '');
        setNewDOB(data.dob || '');
        setProfilePicture(data.avatar || '/profile.jpeg');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage('Failed to fetch profile data. Please try again later.');
      }
    };

    fetchProfile();
  }, []);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
      setMessage('Profile picture selected, but no update action yet.');
    }
  };

  const updateField = async (field, value) => {
    try {
      const response = await axios.put('http://localhost:3000/${field}', { [field]: value }, {
        withCredentials: true, // Send cookies for authentication
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      throw new Error(`Failed to update ${field}`);
    }
  };

  const handleUpdate = async () => {
    let changes = [];
    let errorMessages = [];

    try {
      // Check Email
      if (newEmail && newEmail !== profileData.email) {
        if (validateEmail(newEmail)) {
          await updateField('email', newEmail);
          changes.push(`Email updated to ${newEmail}`);
        } else {
          errorMessages.push('Invalid email address.');
        }
      }

      // Check Phone
      if (newPhone && newPhone !== profileData.phone) {
        if (validatePhone(newPhone)) {
          await updateField('phone', newPhone);
          changes.push(`Phone updated to ${newPhone}`);
        } else {
          errorMessages.push('Invalid phone number. Must be exactly 10 digits.');
        }
      }

      // Check Zipcode
      if (newZipcode && newZipcode !== profileData.zipcode) {
        if (validateZipcode(newZipcode)) {
          await updateField('zipcode', newZipcode);
          changes.push(`Zipcode updated to ${newZipcode}`);
        } else {
          errorMessages.push('Invalid zip code. Must be exactly 5 digits.');
        }
      }

      // Check DOB
      if (newDOB && newDOB !== profileData.dob) {
        if (validateDOB(newDOB)) {
          changes.push(`DOB updated to ${newDOB}`);
          updateUser({ ...loggedInUser, dob: newDOB });
        } else {
          errorMessages.push('You must be at least 18 years old to use this app.');
        }
      }

      // Check Password
      if (newPassword) {
        if (newPassword === confirmPassword) {
          await axios.put('/password', { password: newPassword });
          changes.push('Password updated.');
        } else {
          errorMessages.push('Passwords do not match.');
        }
      }

      // Update Profile Picture
      if (profilePicture && profilePicture !== profileData.profilePicture) {
        // Logic to upload profile picture can be added here.
        changes.push('Profile picture updated.');
      }

      // Handle errors or success
      if (errorMessages.length > 0) {
        setErrors(errorMessages);
      } else if (changes.length > 0) {
        setMessage(`Profile updated: ${changes.join(' | ')}`);
        updateUser({
          ...profileData,
          email: newEmail,
          phone: newPhone,
          zipcode: newZipcode,
          dob: newDOB,
          avatar: profilePicture,
        });
      } else {
        setMessage('No changes made.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      errorMessages.push('An error occurred while updating your profile. Please try again.');
      setErrors(errorMessages);
    }
  };

  const handleBackToMain = () => {
    navigate('/main'); 
  };

  if (!profileData) {
    return <div>Loading...</div>; // Render loading state until profileData is fetched
  }

  return (
    <div className="profile-container">
      <h2>{profileData.username}'s Profile</h2>

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
        <label>Email Address (Current: {profileData.email || 'Not Set'})</label>
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

      {/* Original Date of Birth and Input */}
      <div className="form-group">
        <label>Date of Birth (Current: {loggedInUser.dob})</label>
        <input
          type="date"
          className="form-control"
          value={newDOB}
          onChange={(e) => setNewDOB(e.target.value)}
        />
      </div>

      {/* New Password fields */}
      <div className="form-group">
        <label>Password (Current: {'*'.repeat(loggedInUser.password?.length || 0)})</label> 
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

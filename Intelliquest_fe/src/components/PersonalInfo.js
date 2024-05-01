import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PersonalInfo.css';

function PersonalInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [data, setData] = useState(null);
  const [initialState, setInitialState] = useState(null);

  const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
  const api_url = `${base_url}/IntelliQuest_v1/myprofile/${authState.user}/`;
  const profile_api_url = `${base_url}/IntelliQuest_v1/myprofile/update_picture/${authState.user}/`;

  useEffect(() => {
    if (!authState.user) {
      navigate('/signin');
      return;
    }
    fetchProfileData();
  }, [authState.user, navigate]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(
        api_url,
        {
          method: 'GET',
      
            // 'Authorization': `Bearer ${authState.tokens}`,
            'Content-Type': 'application/json',
        
        
        }
      );

      if (response.ok) {
        const profileData = await response.json();
        setData(profileData);
        setInitialState(profileData);
        setLoading(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Unable to fetch data');
        setLoading(false);
      }
    } catch (error) {
      setError(error.toString());
      setLoading(false);
    }
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewProfilePic(file);
      setData({ ...data, profile_picture: URL.createObjectURL(file) });
    }
  };

  const handleProfilePicUpload = async () => {
    if (!newProfilePic) {
      setError('No new profile picture to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('profile_picture', newProfilePic);
  
    try {
      const response = await fetch(
        profile_api_url,
        {
          method: 'PUT',
            // 'Authorization': `Bearer ${authState.tokens.access}`,
            // 'Content-Type': 'multipart/form-data', // This line should be removed, let the browser set it

          body: formData,
        }
      );
  
      if (response.ok) {
        const result = await response.json();
        setData((prevData) => ({
          ...prevData,
          profile_picture: result.profile_picture,
        }));
        setNewProfilePic(null);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload picture');
      }
    } catch (error) {
      setError(error.toString());
    }
  };
  

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (newProfilePic) {
      await handleProfilePicUpload();
    }

    const updatedFields = Object.keys(data).reduce((fields, key) => {
      if (data[key] !== initialState[key]) {
        fields[key] = data[key];
      }
      return fields;
    }, {});

    try {
      if (Object.keys(updatedFields).length > 0) {
        const response = await fetch(
          api_url,
          {
            method: 'PATCH',
            headers: {
            //   'Authorization': `Bearer ${authState.tokens.access}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedFields),
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          setData(responseData);
          setInitialState(responseData);
          setIsEditing(false);
          setError('');
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to update profile');
        }
      } else {
        setError('No changes to save.');
      }
    } catch (error) {
      setError(error.toString());
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing && initialState) {
      setData(initialState);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Data is not available.</div>;

  return (
    <div className="personal-info">
      <h1>Personal Information</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group profile-pic">
          <label htmlFor="profilePicUpload">Profile Picture</label>
          <img src={data.profile_picture || '../../public/images/default_profile.png'} alt="Profile" className="profile-preview" />
          <input type="file" id="profilePicUpload" accept="image/*" onChange={handleProfilePicChange} disabled={!isEditing} />
          <button type="button" onClick={handleProfilePicUpload} disabled={!isEditing || !newProfilePic}>Upload</button>
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" name="first_name" value={data.first_name || ''} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" name="last_name" value={data.last_name || ''} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input type="date" id="dateOfBirth" name="date_of_birth" value={data.date_of_birth || ''} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={authState.user} onChange={handleInputChange} disabled={true} />
        </div>
        <div className="form-group">
          <label htmlFor="contact">Contact Number</label>
          <input type="tel" id="contact" name="contact" value={data.contact || ''} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input type="text" id="location" name="location" value={data.location || ''} onChange={handleInputChange} disabled={!isEditing} />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={!isEditing}>Save Changes</button>
          <button type="button" onClick={toggleEdit}>
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PersonalInfo;

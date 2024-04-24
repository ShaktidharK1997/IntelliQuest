import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Ensure the path is correct based on your project structure
import './PersonalInfo.css';
function PersonalInfo() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { authState } = useAuth();
    const { signOut } = useAuth(); // Assuming authState includes user and tokens
    const navigate = useNavigate();
    const [newProfilePic, setNewProfilePic] = useState(null);
    const [data, setData] = useState({
        profile_picture: '',
        first_name: 'N/A',
        last_name: 'N/A',
        date_of_birth: '',
        email: '',
        contact: '',
        location: '',
        isEditing: false
    });

    useEffect(() => {
        if (!authState.user) {
            navigate('/signin');
            return; // Prevent further execution if no user is found
        }
        fetchProfileData(); // Fetch profile data on component mount and when authState changes
    }, [authState.user, navigate]);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/IntelliQuest_v1/myprofile/${authState.user}/`, {
                method: 'GET',
                headers: {
                   // 'Authorization': `Bearer ${authState.tokens}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Unable to fetch data');
            }
            const profileData = await response.json();
            console.log(profileData);

            setData({
                ...data,
                ...profileData,
                profile_picture: profileData.profile_picture || '../../public/images/profile_icon.jpeg',
                isEditing: false
            });
        } catch (error) {
            setError(error.message);
            console.error("Error fetching profile data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewProfilePic(file);
            setData({
                ...data,
                profile_picture: URL.createObjectURL(file)
            });
        }
    };

    const handleProfilePicUpload = async () => {
        if (!newProfilePic) {
            console.error("No new profile picture to upload.");
            return;
        }
        const formData = new FormData();
        formData.append('profile_picture', newProfilePic);

        try {
            const response = await fetch(`http://localhost:8000/IntelliQuest_v1/myprofile/update_picture/${authState.user}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authState.tokens}`,
                },
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to upload picture');
            console.log("Profile picture uploaded successfully.");
            fetchProfileData(); // Re-fetch profile data to update UI
        } catch (error) {
            console.error("Error uploading profile picture:", error);
            setError(error.message);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (newProfilePic) {
            await handleProfilePicUpload();
        }
        try {
            const response = await fetch(`http://localhost:8000/IntelliQuest_v1/myprofile/update_profile/${authState.user}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authState.tokens}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to update profile');
            console.log("Profile updated successfully.");
            fetchProfileData(); // Re-fetch profile data to update UI
        } catch (error) {
            console.error("Error updating profile:", error);
            setError(error.message);
        }
    };

    const toggleEdit = () => {
        setData(prev => ({ ...prev, isEditing: !prev.isEditing }));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
      <div className="personal-info">
        <h1>Personal Information</h1>
        <form onSubmit={handleFormSubmit}>
        <div className="form-group profile-pic">
          <label htmlFor="profilePicUpload">Profile Picture</label>
          <img src={data.profile_picture || newProfilePic} alt="Profile" className="profile-preview" />
          <input type="file" id="profilePicUpload" accept="image/*" onChange={handleProfilePicChange} />
          <button type="button" onClick={handleProfilePicUpload}>Upload</button>
        </div>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" value={data.first_name} onChange={e => setData({ ...data, first_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" value={data.last_name} onChange={e => setData({ ...data, last_name: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input type="date" id="dateOfBirth" name="dateOfBirth" value={data.date_of_birth} onChange={e => setData({ ...data, date_of_birth: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="contact">Contact Number</label>
            <input type="tel" id="contact" name="contact" value={data.contact} onChange={e => setData({ ...data, contact: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input type="text" id="location" name="location" value={data.location} onChange={e => setData({ ...data, location: e.target.value })} />
          </div>
          <div className="form-actions">
            <button type="submit">Save Changes</button>
          </div>
        </form>
      </div>
    );
  }
  
  export default PersonalInfo;
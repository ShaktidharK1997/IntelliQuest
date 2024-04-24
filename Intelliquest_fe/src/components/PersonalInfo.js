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
            const response = await fetch(`http://localhost:8000/IntelliQuest_v1/myprofile/${authState.user}/`, {
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
                    <img src={data.profile_picture} alt="Profile" className="profile-preview" />
                    <input type="file" id="profilePicUpload" accept="image/*" onChange={handleProfilePicChange} />
                    {data.isEditing && <button type="button" onClick={handleProfilePicUpload} className="btn upload-btn">Upload</button>}
                </div>
                {data.isEditing ? (
                    Object.entries(data)
                        .filter(([key]) => key !== 'isEditing' && key !== 'profile_picture')
                        .map(([key, value]) => (
                            <div className="form-group" key={key}>
                                <label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</label>
                                <input
                                    type={key === 'date_of_birth' ? 'date' : 'text'}
                                    id={key}
                                    name={key}
                                    value={value}
                                    onChange={handleInputChange}
                                    className="form-control"
                                />
                            </div>
                        ))
                ) : (
                    Object.entries(data)
                        .filter(([key]) => key !== 'isEditing' && key !== 'profile_picture')
                        .map(([key, value]) => (
                            <div className="form-group" key={key}>
                                <label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</label>
                                <span>{value}</span>
                            </div>
                        ))
                )}
                <div className="form-actions">
                    {data.isEditing ? (
                        <>
                            <button type="submit" className="btn save-btn">Save Changes</button>
                            <button type="button" className="btn cancel-btn" onClick={toggleEdit}>Cancel</button>
                        </>
                    ) : (
                        <button type="button" className="btn edit-btn" onClick={toggleEdit}>Edit</button>
                    )}
                </div>
            </form>
        </div>
    );
}

export default PersonalInfo;
import React, { useState, useEffect } from 'react';
import './PersonalInfo.css'; // Ensure you have created this CSS file.

function PersonalInfo() {
  // State for the username to simulate fetching data for the logged-in user
  const [username] = useState('temp_user'); // Replace temp_user with logged in user
  
  // State to handle the profile picture preview
  const [profilePic, setProfilePic] = useState(null);
  
  // State to GET/POST data from backend
  const [data, setProfileData] = useState({
    profile_picture: '',
    first_name: '',
    last_name: '',
    date_of_birth: '', // Assuming 'YYYY-MM-DD' format
    email: '',
    contact: '',
    location: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (username) {
        try {
          const response = await fetch(`http://localhost:8000/myprofile/${username}/`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const jsonData = await response.json();
          const user = jsonData[0];
          setProfileData({
            profile_picture: user.profile_picture || '',
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            date_of_birth: user.date_of_birth || '',
            email: user.email || '',
            contact: user.contact || '',
            location: user.location || '',
          });
        } catch (error) {
          console.error("An error occurred while fetching the profile data:", error);
        }
      }
    };

    fetchData();
  }, [username]);

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleProfilePicUpload = async () => {
    const formData = new FormData();
    const fileField = document.querySelector('input[type="file"]');
    
    if (fileField && fileField.files[0]) {
      formData.append('profile_picture', fileField.files[0]);

    try {
          const response = await fetch(`http://localhost:8000/myprofile/upload_profile_picture/${username}/`, {
            method: 'PUT', // or 'PATCH' if your backend supports it for partial updates
            body: formData, // FormData object, don't set Content-Type header
          });

          if (!response.ok) {
            // If the server responds with a non-OK HTTP status, throw an error
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          console.log("Profile picture uploaded successfully.");
          // Handle success, e.g., updating state or UI to reflect the uploaded image
        } catch (error) {
          console.error("Error uploading profile picture:", error);
        }
      } else {
        console.error("File not selected or file input not found.");
      }
    };
  

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const formData = new FormData();
    if(data.first_name) formData.append('first_name', data.first_name);
    if(data.last_name) formData.append('last_name', data.last_name);
    if(data.email) formData.append('email', data.email);
    if(data.contact) formData.append('contact', data.contact);
    if(data.location) formData.append('location', data.location);
    // if(data.formData.append('username', username);
    if(data.profile_picture) formData.append('profile_pic', data.profile_pic);
    if(data.date_of_birth) formData.append('date_of_birth', data.date_of_birth);
    // Append other fields similarly...
    
    // Assuming `profilePic` holds the file to be uploaded
    if (profilePic) {
        formData.append('profile_picture', profilePic);
    }

    // Add user identifier, adjust according to what your backend expects (username, user ID, etc.)
    // formData.append('user', username);

    try {
      const response = await fetch(`http://localhost:8000/api/personalinfo/${username}/`, {
        method: 'PATCH',
        body: formData, // Note: Don't set Content-Type for FormData; the browser will set it correctly.
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
};



  return (
    <div className="personal-info">
      <h1>Personal Information</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="form-group profile-pic">
          <label htmlFor="profilePicUpload">Profile Picture</label>
          {profilePic && <img src={profilePic} alt="Profile" className="profile-preview" />}
          <input type="file" id="profilePicUpload" accept="image/*" onChange={handleProfilePicChange} />
          <button type="button" onClick={handleProfilePicUpload}>Upload</button>
        </div>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input type="text" id="firstName" name="firstName" value={data.first_name} 
            onChange={e => setProfileData({ ...data, first_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input type="text" id="lastName" name="lastName" value={data.last_name} 
            onChange={e => setProfileData({ ...data, last_name: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">Date of Birth</label>
          <input type="date" id="dateOfBirth" name="dateOfBirth" value={data.date_of_birth} 
            onChange={e => setProfileData({ ...data, date_of_birth: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={data.email}
                onChange={e => setProfileData({ ...data, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact">Contact Number</label>
              <input type="tel" id="contact" name="contact" value={data.contact}
                onChange={e => setProfileData({ ...data, contact: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input type="text" id="location" name="location" value={data.location}
                onChange={e => setProfileData({ ...data, location: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </div>
      );
    }
    
    export default PersonalInfo;
    

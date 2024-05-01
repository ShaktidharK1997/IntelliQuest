import React, { useState, useEffect } from 'react';
import './Education.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Education() {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const navigate = useNavigate();
  const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
  const api_url = `${base_url}/IntelliQuest_v1/myprofile/education/`;
  const api_url_with_email = `${base_url}/IntelliQuest_v1/myprofile/education/${authState.user}/`;

  const defaultEducation = {
    id: null,
    university: '',
    degree: '',
    course: '',
    start_date: '',
    end_date: '',
    location: '',
    gpa: '',
    isEditing: true,
  };

  useEffect(() => {
    if (!authState.user) {
      navigate('/signin');
    } else {
      fetchEducations();
    }
  }, [authState.user, navigate]);

  const fetchEducations = async () => {
    setLoading(true);
    try {
      const response = await fetch(api_url_with_email, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${authState.tokens.access}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Unable to fetch education data');
      } else {
        const data = await response.json();
        setEducations(data.map((edu) => ({ ...edu, isEditing: false })));
      }
    } catch (e) {
      setError('There was an error loading your education information.');
    } finally {
      setLoading(false);
    }
  };

  // All your other functions: handleEducationChange, addEducation, removeEducation, saveEducation, toggleEditing
//... (previous code)

const handleEducationChange = (index, event) => {
  const { name, value } = event.target;
  setEducations((prevEducations) => prevEducations.map((edu, i) => 
    i === index ? { ...edu, [name]: value } : edu
  ));
};

const addEducation = () => {
  setEducations((prevEducations) => [...prevEducations, { ...defaultEducation }]);
};

const removeEducation = async (index) => {
  const education = educations[index];
  const userEmail = encodeURIComponent(authState.user); // URL encode the email

  if (education.id) {
    const url = `${api_url_with_email}${education.id}/`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          // 'Authorization': `Bearer ${authState.tokens.access}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete education');
      }

      setEducations((prevEducations) => prevEducations.filter((_, i) => i !== index));
    } catch (error) {
      setError(error.message);
    }
  } else {
    setEducations((prevEducations) => prevEducations.filter((_, i) => i !== index));
  }
};

const saveEducation = async (index) => {
  const education = educations[index];
  const userEmail = authState.user; // URL encode the email to safely include it in the URL

  const baseEndpoint = api_url_with_email;
  const url = education.id ? `${baseEndpoint}${education.id}/` : baseEndpoint;
  const method = education.id ? 'PUT' : 'POST';

  try {
    const bodyData = {
      ...education,
      start_date: education.start_date ? new Date(education.start_date).toISOString().split('T')[0] : null,
      end_date: education.end_date ? new Date(education.end_date).toISOString().split('T')[0] : null,
    };

    if (method === 'POST') {
      delete bodyData.id; // Remove id for POST request
    }
    
    const response = await fetch(url, {
      method: method,
      headers: {
        // 'Authorization': `Bearer ${authState.tokens.access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error('Failed to save education');
    }

    const savedEducation = await response.json();
    setEducations((prevEducations) => prevEducations.map((edu, i) => 
      i === index ? { ...edu, ...savedEducation, isEditing: false } : edu
    ));
  } catch (error) {
    setError(error.message);
  }
};


const toggleEditing = (index) => {
  setEducations((prevEducations) => prevEducations.map((edu, i) => 
    i === index ? { ...edu, isEditing: !edu.isEditing } : edu
  ));
};

// ... (rest of the component)

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="education-container">
      <h2>Education</h2>
      {educations.map((education, index) => (
        <div key={index} className="education-entry">
          {education.isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); saveEducation(index); }}>
              <input type="text" name="university" placeholder="University" value={education.university} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="degree" placeholder="Degree" value={education.degree} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="course" placeholder="Course" value={education.course} onChange={(e) => handleEducationChange(index, e)} />
              <input type="date" name="start_date" value={education.start_date} onChange={(e) => handleEducationChange(index, e)} />
              <input type="date" name="end_date" value={education.end_date} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="location" placeholder="Location" value={education.location} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="gpa" placeholder="GPA" value={education.gpa} onChange={(e) => handleEducationChange(index, e)} />
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => toggleEditing(index)} className="cancel-btn">Cancel</button>
            </form>
          ) : (
            <div className='education-text'>
              <div>University: {education.university}</div>
              <div>Degree: {education.degree}</div>
              <div>Course: {education.course}</div>
              <div>From: {education.start_date}</div>
              <div>To: {education.end_date}</div>
              <div>Location: {education.location}</div>
              <div>GPA: {education.gpa}</div>
              <button onClick={() => toggleEditing(index)}>Edit</button>
              <button onClick={() => removeEducation(index)}>Remove</button>
            </div>
          )}
        </div>
      ))}
      <button onClick={addEducation} className="add-education-btn">Add Education</button>
    </div>
  );
}

export default Education;

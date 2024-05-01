import React, { useState, useEffect } from 'react';
import './Experience.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const navigate = useNavigate();
  const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
  const api_url = `${base_url}/IntelliQuest_v1/myprofile/experience/`;
  const api_url_with_email = `${base_url}/IntelliQuest_v1/myprofile/experience/${authState.user}/`;

  const defaultExperience = {
    id: null,
    company: '',
    title: '',
    responsibilities: '',
    start_date: '',
    end_date: '',
    location: '',
    is_current: false,
    isEditing: true,
  };


  useEffect(() => {
    if (!authState.user) {
      navigate('/signin');
    } else {
      fetchExperiences();
    }
  }, [authState.user, navigate]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const response = await fetch(api_url_with_email, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authState.tokens.access}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Unable to fetch experience data');
      } else {
        const data = await response.json();
        setExperiences(data.map((exp) => ({ ...exp, isEditing: false })));
      }
    } catch (err) {
      setError('There was an error loading your work experience information.');
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceChange = (index, event) => {
    const { name, value, type, checked } = event.target;
    setExperiences((prev) => prev.map((exp, i) =>
      i === index ? { ...exp, [name]: type === 'checkbox' ? checked : value } : exp
    ));
  };

  const saveExperience = async (index) => {
    const experience = experiences[index];
    const userEmail = encodeURIComponent(authState.user); // URL encode the email
    const url = experience.id ? `${api_url}${userEmail}/${experience.id}/` 
    : `${api_url}${userEmail}/`;
    const method = experience.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authState.tokens.access}`,
        },
        body: JSON.stringify({
          ...experience,
          start_date: experience.start_date,
          end_date: experience.is_current ? null : experience.end_date,
        }),
      });
      if (!response.ok) throw new Error('Failed to save the experience');

      const savedExperience = await response.json();
      setExperiences((prev) => prev.map((exp, i) =>
        i === index ? { ...exp, ...savedExperience, isEditing: false } : exp
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { ...defaultExperience }]);
  };

  const removeExperience = async (index) => {
    const experience = experiences[index];
    if (!experience.id) {
      setExperiences((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    const url = `${api_url}${authState.user}/${experience.id}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          // 'Authorization': `Bearer ${authState.tokens.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete the experience');
      setExperiences((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleEditing = (index) => {
    setExperiences((prev) => prev.map((exp, i) =>
      i === index ? { ...exp, isEditing: !exp.isEditing } : exp
    ));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="experience-container">
      <h2>Work Experience</h2>
      {experiences.map((experience, index) => (
        <div key={index} className="experience-entry">
          {experience.isEditing ? (
            <div>
              <input type="text" name="company" placeholder="Company" value={experience.company} onChange={(e) => handleExperienceChange(index, e)} />
              <input type="text" name="title" placeholder="Job Title" value={experience.title} onChange={(e) => handleExperienceChange(index, e)} />
              <textarea name="responsibilities" placeholder="Responsibilities" value={experience.responsibilities} onChange={(e) => handleExperienceChange(index, e)} />
              <input type="date" name="start_date" value={experience.start_date} onChange={(e) => handleExperienceChange(index, e)} />
              <input type="date" name="end_date" value={experience.end_date} disabled={experience.is_current} onChange={(e) => handleExperienceChange(index, e)} />
              <input type="text" name="location" placeholder="Location" value={experience.location} onChange={(e) => handleExperienceChange(index, e)} />
              <label>
                <input type="checkbox" name="is_current" checked={experience.is_current} onChange={(e) => handleExperienceChange(index, e)} /> Current Job
              </label>
              <button onClick={() => saveExperience(index)} className="save-btn">Save</button>
              <button onClick={() => toggleEditing(index)} className="cancel-btn">Cancel</button>
            </div>
          ) : (
            <div>
              <div>Company: {experience.company}</div>
              <div>Job Title: {experience.title}</div>
              <div>Responsibilities: {experience.responsibilities}</div>
              <div>From: {experience.start_date}</div>
              <div>To: {experience.end_date || "Present"}</div>
              <div>Location: {experience.location}</div>
              <button onClick={() => toggleEditing(index)}>Edit</button>
              <button onClick={() => removeExperience(index)}>Remove</button>
            </div>
          )}
        </div>
      ))}
      <button onClick={addExperience} className="add-experience-btn">Add Experience</button>
    </div>
  );
}

export default Experience;

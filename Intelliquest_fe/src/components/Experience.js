import React, { useState, useEffect } from 'react';
import './Experience.css';

const defaultExperience = {
  company: '',
  title: '',
  responsibilities: '',
  start_date: '',
  end_date: '',
  location: '',
  is_current: false,
  isEditing: true,  // New entries should be editable by default
};

function Experience() {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    // Initially fetch the experiences from the backend
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/experiences/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Assume token is stored in localStorage
          'Content-Type': 'application/json'
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch experiences');
      setExperiences(data.map(item => ({ ...item, isEditing: false })));
    } catch (error) {
      console.error('Fetch experiences error:', error);
    }
  };

  const handleExperienceChange = (index, event) => {
    const { name, value, type, checked } = event.target;
    setExperiences(experiences => experiences.map((exp, i) =>
      i === index ? { ...exp, [name]: type === 'checkbox' ? checked : value } : exp
    ));
  };

  const addExperience = () => {
    setExperiences(experiences => [...experiences, { ...defaultExperience }]);
  };

  const removeExperience = async (index) => {
    const experience = experiences[index];
    if (experience.id) {
      try {
        const response = await fetch(`http://localhost:8000/api/experiences/${experience.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to delete experience');
      } catch (error) {
        console.error('Delete experience error:', error);
        return;
      }
    }
    setExperiences(experiences => experiences.filter((_, i) => i !== index));
  };

  const saveExperience = async (index) => {
    const experience = experiences[index];
    const url = experience.id ? `http://localhost:8000/api/experiences/${experience.id}/` : 'http://localhost:8000/api/experiences/';
    const method = experience.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(experience),
      });
      if (!response.ok) throw new Error('Failed to save experience');
      const updatedExperience = await response.json();

      setExperiences(experiences => experiences.map((exp, i) =>
        i === index ? { ...exp, ...updatedExperience, isEditing: false } : exp
      ));
    } catch (error) {
      console.error('Save experience error:', error);
    }
  };

  return (
    <div className="experience-container">
      <h2>Work Experience</h2>
      {experiences.map((experience, index) => (
        <div key={index} className="experience-entry">
          {experience.isEditing ? (
            <form onSubmit={e => { e.preventDefault(); saveExperience(index); }}>
              <input type="text" name="company" placeholder="Company" value={experience.company} onChange={e => handleExperienceChange(index, e)} />
              <input type="text" name="title" placeholder="Job Title" value={experience.title} onChange={e => handleExperienceChange(index, e)} />
              <textarea name="responsibilities" placeholder="Responsibilities" value={experience.responsibilities} onChange={e => handleExperienceChange(index, e)} />
              <input type="date" name="start_date" value={experience.start_date} onChange={e => handleExperienceChange(index, e)} />
              <input type="date" name="end_date" value={experience.end_date} disabled={experience.is_current} onChange={e => handleExperienceChange(index, e)} />
              <input type="text" name="location" placeholder="Location" value={experience.location} onChange={e => handleExperienceChange(index, e)} />
              <label>
                <input type="checkbox" name="is_current" checked={experience.is_current} onChange={e => handleExperienceChange(index, e)} /> Current Job
              </label>
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => removeExperience(index)} className="cancel-btn">Remove</button>
            </form>
          ) : (
            <>
              <div>Company: {experience.company}</div>
              <div>Job Title: {experience.title}</div>
              <div>Responsibilities: {experience.responsibilities}</div>
              <div>From: {experience.start_date}</div>
              <div>To: {experience.end_date || "Present"}</div>
              <div>Location: {experience.location}</div>
              <button onClick={() => setExperiences(experiences => experiences.map((exp, i) => i === index ? { ...exp, isEditing: true } : exp))}>Edit</button>
              <button onClick={() => removeExperience(index)}>Remove</button>
            </>
          )}
        </div>
      ))}
      <button onClick={addExperience} className="add-experience-btn">Add Experience</button>
    </div>
  );
}

export default Experience;

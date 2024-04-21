import React, { useState, useEffect } from 'react';
import './Education.css'; // Ensure you have created this CSS file for styling.

const defaultEducation = {
  id: null, // Include id for tracking and updating existing records
  university: '',
  degree: '',
  major: '',
  from: '',
  to: '',
  location: '',
  gpa: '',
  isEditing: true, // New entries should be editable by default
};

function Education() {
  const [educations, setEducations] = useState([]);

  useEffect(() => {
    // Fetch education records from the backend when the component mounts
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/educations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error('Failed to fetch educations');
      }
      setEducations(data.map(edu => ({ ...edu, isEditing: false })));
    } catch (error) {
      console.error('Fetch educations error:', error.message);
    }
  };

  const handleEducationChange = (index, event) => {
    const { name, value } = event.target;
    setEducations(educations => educations.map((edu, i) => 
      i === index ? { ...edu, [name]: value } : edu
    ));
  };

  const addEducation = () => {
    setEducations(educations => [...educations, { ...defaultEducation }]);
  };

  const removeEducation = async (index) => {
    const education = educations[index];
    if (education.id) {
      try {
        const response = await fetch(`http://localhost:8000/api/educations/${education.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to delete education');
        }
      } catch (error) {
        console.error('Delete education error:', error.message);
        return; // Exit if the delete operation fails
      }
    }
    setEducations(educations => educations.filter((_, i) => i !== index));
  };

  const saveEducation = async (index) => {
    const education = educations[index];
    const url = education.id ? `http://localhost:8000/api/educations/${education.id}/` : 'http://localhost:8000/api/educations/';
    const method = education.id ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(education),
      });
      if (!response.ok) {
        throw new Error('Failed to save education');
      }
      const savedEducation = await response.json();
      setEducations(educations => educations.map((edu, i) => 
        i === index ? { ...edu, ...savedEducation, isEditing: false } : edu
      ));
    } catch (error) {
      console.error('Save education error:', error.message);
    }
  };

  const toggleEditing = (index) => {
    setEducations(educations => educations.map((edu, i) => 
      i === index ? { ...edu, isEditing: !edu.isEditing } : edu
    ));
  };

  return (
    <div className="education-container">
      <h2>Education</h2>
      {educations.map((education, index) => (
        <div key={index} className="education-entry">
          {education.isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); saveEducation(index); }}>
              <input type="text" name="university" placeholder="University" value={education.university} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="degree" placeholder="Degree" value={education.degree} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="major" placeholder="Major" value={education.major} onChange={(e) => handleEducationChange(index, e)} />
              <input type="date" name="from" value={education.from} onChange={(e) => handleEducationChange(index, e)} />
              <input type="date" name="to" value={education.to} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="location" placeholder="Location" value={education.location} onChange={(e) => handleEducationChange(index, e)} />
              <input type="text" name="gpa" placeholder="GPA" value={education.gpa} onChange={(e) => handleEducationChange(index, e)} />
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => toggleEditing(index)} className="cancel-btn">Cancel</button>
            </form>
          ) : (
            <>
              <div>University: {education.university}</div>
              <div>Degree: {education.degree}</div>
              <div>Major: {education.major}</div>
              <div>From: {education.from}</div>
              <div>To: {education.to || "Present"}</div>
              <div>Location: {education.location}</div>
              <div>GPA: {education.gpa}</div>
              <button onClick={() => toggleEditing(index)}>Edit</button>
              <button onClick={() => removeEducation(index)}>Remove</button>
            </>
          )}
        </div>
      ))}
      <button onClick={addEducation} className="add-education-btn">Add Education</button>
    </div>
  );
}

export default Education;

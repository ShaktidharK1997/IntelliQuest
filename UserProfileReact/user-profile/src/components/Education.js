// Education.js
import React, { useState } from 'react';
import './Education.css'; // Ensure you have created this CSS file for styling.

const defaultEducation = {
  university: '',
  degree: '',
  course: '',
  from: '',
  to: '',
  location: '',
  gpa: '',
};

function Education() {
  const [educations, setEducations] = useState([defaultEducation]);

  const handleEducationChange = (index, event) => {
    const updatedEducations = educations.map((education, i) => {
      if (i === index) {
        return { ...education, [event.target.name]: event.target.value };
      }
      return education;
    });
    setEducations(updatedEducations);
  };

  const addEducation = () => {
    setEducations([...educations, defaultEducation]);
  };

  const removeEducation = (index) => {
    const updatedEducations = educations.filter((_, i) => i !== index);
    setEducations(updatedEducations);
  };
  const saveEducations = () => {
    // TODO: Implement the logic to save the changes, e.g., make an API call to the backend.
    console.log('Educations saved', educations);
  };

  return (
    <div className="education-container">
      <h2>Education</h2>
      {educations.map((education, index) => (
        <div key={index} className="education-entry">
          <input
            type="text"
            name="university"
            placeholder="University"
            value={education.university}
            onChange={(e) => handleEducationChange(index, e)}
          />

          <input
            type="text"
            name="degree"
            placeholder="Degree"
            value={education.degree}
            onChange={(e) => handleEducationChange(index, e)}
          />

          <input
            type="text"
            name="Major"
            placeholder="Major"
            value={education.major}
            onChange={(e) => handleEducationChange(index, e)}
          />
          <label htmlFor="education_from">From</label>
          <input
            type="date"
            name="from_date"
            placeholder="From"
            value={education.from_date}
            onChange={(e) => handleEducationChange(index, e)}
          />
          <label htmlFor="education_to">To</label>
          <input
            type="date"
            name="to_date"
            placeholder="To"
            value={education.to_date}
            onChange={(e) => handleEducationChange(index, e)}
          />




          {/* Repeat for degree, course, from, to, location, and gpa */}
          <button onClick={() => removeEducation(index)}>Remove</button>
        </div>
      ))}
      <button onClick={addEducation}>Add Education</button>
      <div className="form-actions">
        <button onClick={saveEducations}>Save Changes</button>
      </div>
    </div>
    
    
  );
}

export default Education;

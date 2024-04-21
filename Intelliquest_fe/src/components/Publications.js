import React, { useState } from 'react';
import './Publications.css'; // Ensure this CSS file is styled similarly to Experience.css

const defaultPublication = {
  title: '',
  published_date: '',
  authors: '',
  abstract: '',
  isEditing: true,  // Start in edit mode when adding a new publication
};

function Publications() {
  const [publications, setPublications] = useState([]);

  const handlePublicationChange = (index, event) => {
    const { name, value } = event.target;
    const updatedPublications = publications.map((publication, i) => {
      if (i === index) {
        return { ...publication, [name]: value };
      }
      return publication;
    });
    setPublications(updatedPublications);
  };

  const addPublication = () => {
    setPublications([...publications, {...defaultPublication, isEditing: true}]);
  };

  const removePublication = (index) => {
    const updatedPublications = publications.filter((_, i) => i !== index);
    setPublications(updatedPublications);
  };

  const startEditing = (index) => {
    const updatedPublications = publications.map((publication, i) => {
      if (i === index) {
        return { ...publication, isEditing: true };
      }
      return publication;
    });
    setPublications(updatedPublications);
  };

  const cancelEditing = (index) => {
    if (!publications[index].title && !publications[index].published_date && !publications[index].authors && !publications[index].abstract) {
      // If the publication was newly added and still empty, remove it on cancel
      removePublication(index);
    } else {
      const updatedPublications = publications.map((publication, i) => {
        if (i === index) {
          return { ...publication, isEditing: false };
        }
        return publication;
      });
      setPublications(updatedPublications);
    }
  };

  const savePublication = (index) => {
    const updatedPublications = publications.map((publication, i) => {
      if (i === index) {
        return { ...publication, isEditing: false };
      }
      return publication;
    });
    setPublications(updatedPublications);
    console.log('Publication saved:', publications[index]);
    // TODO: Implement the logic to save the changes to the backend
  };

  return (
    <div className="publication-container">
      <h2>Published Articles</h2>
      {publications.map((publication, index) => (
        <div key={index} className="publication-entry">
          {publication.isEditing ? (
            <>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={publication.title}
                onChange={(e) => handlePublicationChange(index, e)}
              />
              <input
                type="text"
                name="published_date"
                placeholder="MM-DD-YYYY"
                value={publication.published_date}
                onChange={(e) => handlePublicationChange(index, e)}
              />
              <input
                type="text"
                name="authors"
                placeholder="Authors"
                value={publication.authors}
                onChange={(e) => handlePublicationChange(index, e)}
              />
              <textarea
                name="abstract"
                placeholder="Abstract"
                value={publication.abstract}
                onChange={(e) => handlePublicationChange(index, e)}
              />
              <button onClick={() => savePublication(index)} className="save-btn">Save</button>
              <button onClick={() => cancelEditing(index)} className="cancel-btn">Cancel</button>
            </>
          ) : (
            <>
              <div>Title: {publication.title}</div>
              <div>Published Date: {publication.published_date}</div>
              <div>Authors: {publication.authors}</div>
              <div>Abstract: {publication.abstract}</div>
              <button onClick={() => startEditing(index)}>Edit</button>
              <button onClick={() => removePublication(index)}>Remove</button>
            </>
          )}
        </div>
      ))}
      <button onClick={addPublication} className="add-publication-btn">Add Publication</button>
    </div>
  );
}

export default Publications;

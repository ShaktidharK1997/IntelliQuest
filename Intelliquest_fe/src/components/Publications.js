import React, { useState, useEffect } from 'react';
import './Publications.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const navigate = useNavigate();

  const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
  const api_url = `${base_url}/IntelliQuest_v1/myprofile/publications/${authState.user}/`;


  const defaultPublication = {
    id: null,
    title: '',
    published_date: '',
    authors: '',
    abstract: '',
    isEditing: true,  // Start in edit mode for new entries
  };

  useEffect(() => {
    if (!authState.user) {
      navigate('/signin');
    } else {
      fetchPublications();
    }
  }, [authState.user, navigate]);

  const fetchPublications = async () => {
    setLoading(true);
    try {
      const response = await fetch(api_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authState.tokens.access}`, // Uncomment if using token authentication
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Unable to fetch publication data');
      } else {
        const data = await response.json();
        setPublications(data.map((pub) => ({ ...pub, isEditing: false })));
      }
    } catch (e) {
      setError('There was an error loading your publication information.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublicationChange = (index, event) => {
    const { name, value } = event.target;
    setPublications((prev) => prev.map((pub, i) =>
      i === index ? { ...pub, [name]: value } : pub
    ));
  };

  const addPublication = () => {
    setPublications([...publications, { ...defaultPublication }]);
  };

  const removePublication = async (index) => {
    const publication = publications[index];
    if (!publication.id) {
      setPublications((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    const url = `${api_url}/${publication.id}/`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authState.tokens.access}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete the publication');
      setPublications((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setError(err.message);
    }
  };

  const savePublication = async (index) => {
    const publication = publications[index];
    const url = publication.id
      ? `${api_url}/${publication.id}/`
      : api_url;
    const method = publication.id ? 'PUT' : 'POST';

    try {
      const bodyData = {
        ...publication,
        published_date: publication.published_date ? new Date(publication.published_date).toISOString().split('T')[0] : null,
      };
      if (method === 'POST') {
        delete bodyData.id; // Remove id for POST request
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authState.tokens.access}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        throw new Error('Failed to save the publication');
      }

      const savedPublication = await response.json();
      setPublications((prev) => prev.map((pub, i) =>
        i === index ? { ...pub, ...savedPublication, isEditing: false } : pub
      ));
    } catch (err) {
      setError(err.message);
    }
  };
  const cancelEditing = (index) => {
    // If the publication has an id, it means it is already saved and we're just toggling off editing
    if (publications[index].id) {
      setPublications((prev) => prev.map((pub, i) =>
        i === index ? { ...pub, isEditing: false } : pub
      ));
    } else {
      // If there's no id, it's a new, unsaved publication, so remove it entirely
      setPublications((prev) => prev.filter((_, i) => i !== index));
    }
  };
  
  const toggleEditing = (index) => {
    setPublications((prev) => prev.map((pub, i) =>
      i === index ? { ...pub, isEditing: !pub.isEditing } : pub
    ));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="publication-container">
      <h2>Published Articles</h2>
      {publications.map((publication, index) => (
        <div key={index} className="publication-entry">
          {publication.isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); savePublication(index); }}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={publication.title}
                onChange={(e) => handlePublicationChange(index, e)}
              />
              <input
                type="date"
                name="published_date"
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
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => cancelEditing(index)} className="cancel-btn">Cancel</button>
            </form>
          ) : (
            <>
              <div>Title: {publication.title}</div>
              <div>Published Date: {publication.published_date}</div>
              <div>Authors: {publication.authors}</div>
              <div>Abstract: {publication.abstract}</div>
              <button onClick={() => toggleEditing(index)}>Edit</button>
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
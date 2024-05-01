import React, { useState, useEffect } from 'react';
import './Bookmarks.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [recommendedPapers, setRecommendedPapers] = useState([]); // Added this line
  const [Bookmarksforrec, setBookmarksforrec] = useState([]); // Added this line
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authState } = useAuth();
  const navigate = useNavigate();
  const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
  const api_url = `${base_url}/IntelliQuest_v1/myprofile/bookmarked/${authState.user}/`;

  useEffect(() => {
    if (!authState.user) {
      navigate('/signin');
    } else {
      fetchBookmarks();
    }
  }, [authState.user, navigate]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const response = await fetch(api_url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Unable to fetch bookmark data');
      } else {
        const data = await response.json();
        setBookmarksforrec(data);
        setBookmarks(data.map((bm) => ({ ...bm, isEditing: false })));
      }
    } catch (e) {
      setError('There was an error loading your bookmarked papers.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEditing = (index) => {
    setBookmarks(prev => prev.map((bm, i) => 
      i === index ? { ...bm, isEditing: !bm.isEditing } : bm
    ));
  };

  const handleBookmarkChange = (index, event) => {
    const { name, value } = event.target;
    setBookmarks(prev => prev.map((bm, i) => 
      i === index ? { ...bm, [name]: value } : bm
    ));
  };

  const fetchRecommendationsBasedOnBookmarks = async () => {
    if (!bookmarks.length) {
        console.log('No bookmarks to base recommendations on.');
        return;
    }

    const positivePaperIds = bookmarks.map(bm => bm.paperID);
    try {
        const response = await fetch('https://api.semanticscholar.org/recommendations/v1/papers/', {
            method: 'POST',
            headers: {
                'x-api-key': '8kxH5DVIYTaE4X2naV3l83RYdf0bYxg7DSFdd7U3',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ positivePaperIds, negativePaperIds: [] }),
        });
        if (!response.ok) {
            throw new Error('Error fetching recommended papers based on bookmarks');
        }
        const data = await response.json();
        console.log(data);
        return data.recommendedPapers; // Assuming this matches the structure you showed
    } catch (error) {
        console.error('Error in fetching recommendations based on bookmarks:', error);
        throw error;
    }
};

useEffect(() => {
    if (bookmarks.length > 0) {
        fetchRecommendationsBasedOnBookmarks().then(recommendedPapers => {
            setRecommendedPapers(recommendedPapers);
        }).catch(console.error);
    }
}, [bookmarks]);
  

  const saveBookmark = async (index) => {
    const bookmark = bookmarks[index];
    const url = bookmark.paperID ? `${api_url}${bookmark.paperID}/` : api_url;
    const method = bookmark.paperID ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmark),
      });

      if (!response.ok) {
        throw new Error('Failed to save bookmark');
      }

      const savedBookmark = await response.json();
      setBookmarks(prev => prev.map((bm, i) => 
        i === index ? { ...bm, ...savedBookmark, isEditing: false } : bm
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bookmarked-papers-container">
      <h2>Bookmarked Papers</h2>
      {bookmarks.map((bookmark, index) => (
        <div key={index} className="bookmark-entry">
          {bookmark.isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); saveBookmark(index); }}>
              <input type="text" name="title" placeholder="Title" value={bookmark.title} onChange={(e) => handleBookmarkChange(index, e)} />
              <input type="text" name="year" placeholder="Year" value={bookmark.year} onChange={(e) => handleBookmarkChange(index, e)} />
              <button type="submit">Save</button>
              <button onClick={() => toggleEditing(index)}>Cancel</button>
            </form>
          ) : (
            <div>
                <div>
                Title: 
                <Link to={`/PaperDetail?paperid=${bookmark.paperID}&source=${bookmark.papersource}`} style={{ color: 'blue', textDecoration: 'none' }}>
                {bookmark.title}
                </Link>
                </div>
              <div>Year: {bookmark.year}</div>
              <button onClick={() => toggleEditing(index)}>Edit</button>
            </div>
          )}
        </div>
      ))}
      {/* <button onClick={() => setBookmarks(prev => [...prev, { title: '', year: '', papersource: '', isEditing: true }])}>Add Bookmark</button> */}
      <div className="recommended-papers-container">
        <h2>Papers you may like</h2>
        {recommendedPapers.map((paper, index) => (
          <div key={index} className="recommended-paper-entry">
            <div>
              Title:
              <Link to={`/PaperDetail?paperid=${paper.paperID}&source=${paper.source}`} style={{ color: 'blue', textDecoration: 'none' }}>
                {paper.title}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
    
  );
}

export default Bookmarks;

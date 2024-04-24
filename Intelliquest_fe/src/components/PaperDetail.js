import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../logo.svg';
import { useAuth } from '../contexts/AuthContext';
import './PaperDetail.css';

function PaperDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState('');
  const [recommendedPapers, setRecommendedPapers] = useState([]);
  const [showRecommendedPapers, setShowRecommendedPapers] = useState(false);

  
  const paperId = new URLSearchParams(location.search).get('paperid');
  const source = new URLSearchParams(location.search).get('source');

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/IntelliQuest_v1/paper/?paperid=${paperId}&source=${source}`);
        const data = await response.json();
        if (data) {
          setPaper(data);
        } else {
          setError("Paper not found.");
        }
      } catch (error) {
        console.error("Failed to fetch paper details:", error);
        setError("Failed to load paper details. Please try again.");
      }
    };

    fetchPaperDetails();
  }, [paperId]);

  const bookmarkPaper = () => {
    console.log("Bookmarking paper", paperId);
    // Implement bookmarking logic here
  };

  const fetchRecommendedPapers = async (positivePaperIds, negativePaperIds) => {
    try {
      const response = await fetch('https://api.semanticscholar.org/recommendations/v1/papers/', {
        method: 'POST',
        headers: {
          'x-api-key': '8kxH5DVIYTaE4X2naV3l83RYdf0bYxg7DSFdd7U3',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ positivePaperIds, negativePaperIds }),
      });
      if (!response.ok) {
        throw new Error('Error fetching recommended papers');
      }
      const data = await response.json();
      console.log(data);
      return data.recommendedPapers; // Assuming this matches the structure you showed
    } catch (error) {
      console.error('Error fetching recommended papers:', error);
      throw error;
    }
  };
  

  const seeRelatedPapers = async () => {
    try {
      const response = await fetchRecommendedPapers([paperId], []);
      setRecommendedPapers(response);
      setShowRecommendedPapers(true);
    } catch (error) {
      console.error('Error getting related papers:', error);
    }
  };

  const ViewPaper = () => {
    if (paper && paper.downloadLink) {
      const container = document.getElementById('pdfViewer');
      container.innerHTML = `<embed src="${paper.downloadLink}" type="application/pdf" width="100%" height="600px" />`;
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!paper) {
    return <div>Loading...</div>;
  }

  return (
    <div className="paper-detail-container">
      <div className="header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={Logo} alt="IntelliQuest Logo" />
        </div>
      </div>
      <div className="paper-detail">
        <h2>{paper.title}</h2>
        <p><strong>Authors:</strong> {paper.authors.join(', ')}</p>
        <p><strong>Year:</strong> {paper.year}</p>
        <p><strong>Abstract:</strong> {paper.abstract}</p>
        <p><strong>Citation Count:</strong> {paper.citationcount === 0 ? 'Not Available' : paper.citationcount}</p>
        <p><strong>Publication Venue:</strong> {paper.pubvenue === "" ? 'Not Available' : paper.pubvenue}</p>
        <div className="paper-detail-buttons">
          <button onClick={ViewPaper}>View Paper</button>
          <button onClick={bookmarkPaper}>Bookmark Paper</button>
          <button onClick={seeRelatedPapers}>See Related Papers</button>
        </div>
        <div className="pdf-viewer"id="pdfViewer"></div>
        {showRecommendedPapers && (
        <div className="recommended-papers-container">
          <h3>Recommended Papers</h3>
          <div className="recommended-papers-list">
            {recommendedPapers.map((paper) => (
              <div
                key={paper.paperId}
                className="recommended-paper"
                onClick={() => navigate(`/paperdetail?paperid=${paper.paperId}`)}
                style={{ cursor: 'pointer' }}
              >
                <p>{paper.title}</p>
              </div>
              ))}
            </div>
          </div>
          )}
      </div>
    </div>
  );
}

export default PaperDetail;

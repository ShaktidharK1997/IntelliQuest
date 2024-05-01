import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../logo.svg';
import { useAuth } from '../contexts/AuthContext';
import './PaperDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import AuthorPopup from './AuthorPopup';

function PaperDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState } = useAuth();
  const [paper, setPaper] = useState(null);
  const [error, setError] = useState('');
  const [recommendedPapers, setRecommendedPapers] = useState([]);
  const [showRecommendedPapers, setShowRecommendedPapers] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState({});
  const base_url = `${window.location.protocol}//${window.location.hostname}:8000`;
  const [isBookmarked, setIsBookmarked] = useState(false);


  //const [currentUser] = authState.user;
  const paperId = new URLSearchParams(location.search).get('paperid');
  const source = new URLSearchParams(location.search).get('source');

  const apiUrl = `${base_url}/IntelliQuest_v1/paper/?paperid=${paperId}&source=${source}`;


  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data) {
          setPaper(data);
          setRecommendedPapers([]);  // Reset recommended papers
          setShowRecommendedPapers(false);  // Hide the recommended papers section
          setShowPDF(false);  // Hide the PDF viewer
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

  const bookmarkPaper = async () => {
    console.log("Bookmarking paper", paperId);
  
    // Assuming you need to send the paper ID and other details to the API
    const bookmarkData = {
      paperID: paperId,
      title: paper.title,
      year: paper.year,
      papersource: source  // Assuming 'source' contains the source of the paper
    };
  
    // URL to your API endpoint that handles the creation of bookmarks
    const bookmarkUrl = `${base_url}/IntelliQuest_v1/myprofile/bookmarked/${authState.user}/`;
  
    try {
      const response = await fetch(bookmarkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${authState.tokens.access}`, // Uncomment if using token based auth
        },
        body: JSON.stringify(bookmarkData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to bookmark paper.');
      }
  
      console.log("Paper bookmarked successfully.");
      setIsBookmarked(true);
      // You might want to update local state to reflect the bookmark
    } catch (error) {
      console.error("Error bookmarking paper:", error.message);
      setError(error.message);
    }
  };

  const handleAuthorClick = async (author) => {
    try {
      const response = await fetch(`https://api.semanticscholar.org/graph/v1/author/${author.authorId}/papers?limit=10`);
      const papersData = await response.json();
      
      // Format the author data to include the author's name and ID along with the papers
      const formattedAuthorData = {
        name: author.name,
        authorId: author.authorId,
        papers: papersData.data  // Accessing the 'data' field for papers
      };
  
      console.log(formattedAuthorData); // Logging to see the structure
      setSelectedAuthor(formattedAuthorData);
      setShowPopup(true);
    } catch (error) {
      console.error("Failed to fetch author details:", error);
    }
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
      setShowPDF(true);
    }
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
        <div>
          <p><strong>Authors:</strong> {paper.authors.map(author => (
            <span key={author.authorId} onClick={() => handleAuthorClick(author)} style={{ cursor: 'pointer', color: 'blue' }}>
              {author.name}
            </span>
          )).reduce((prev, curr) => [prev, ', ', curr])}</p>

          
        </div>
        <p><strong>Year:</strong> {paper.year}</p>
        <p><strong>Abstract:</strong> {paper.abstract}</p>
        <p><strong>Citation Count:</strong> {paper.citationCount === 0 ? 'Not Available' : paper.citationCount}</p>
        <p><strong>Publication Venue:</strong> {paper.publicationVenue === "" ? 'Not Available' : paper.publicationVenue}</p>
        <div className="paper-detail-buttons">
          <button 
          onClick={ViewPaper}
          >
          {paper.downloadLink ? (
            <>
              <FontAwesomeIcon icon={faDownload} /> Download Paper
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faTimesCircle} /> Paper Not Available
            </>
          )}
          </button>
          <button onClick={bookmarkPaper} className={isBookmarked ? "bookmark-button bookmarked" : "bookmark-button"}>
              Bookmark Paper
          </button>
          <button onClick={seeRelatedPapers}>See Related Papers</button>
        </div>
        {showPopup && (
          <>
            {/* Overlay that dims the background and can close the popup when clicked */}
            <div className="popup-background" onClick={() => setShowPopup(false)}></div>

            {/* Actual popup container */}
            <div className="popup">
              <div className="popup-inner">
                {/* Popup content goes here */}
                <AuthorPopup author={selectedAuthor} onClose={() => setShowPopup(false)} source={source} />
              </div>
            </div>
          </>
        )}
        {showPDF && (<div className="pdf-viewer"id="pdfViewer"></div>)}
        
        {showRecommendedPapers && (
        <div className="recommended-papers-container">
          <h3>Recommended Papers</h3>
          <div className="recommended-papers-list">
            {recommendedPapers.map((paper) => (
              <Link 
              to={`/PaperDetail?paperid=${paper.paperId}&source=${source}`} 
              className="recommended-paper"
            >
              {paper.title}
            </Link>
              ))}
            </div>
          </div>
          )}
      </div>
    </div>
  );
}

export default PaperDetail;

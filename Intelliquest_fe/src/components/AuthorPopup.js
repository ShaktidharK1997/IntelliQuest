import {Link} from 'react-router-dom';
const AuthorPopup = ({ author, onClose, source }) => {
    if (!author) return null;
  
    return (
      <div className="popup">
        <div className="popup-inner">
          <h2>{author.name} (ID: {author.authorId})</h2>
          <h3>Papers</h3>
          <ul>
            {author.papers?.map((paper, index) => (
              <li key={index}>
              <Link 
                key={index}
                to={`/PaperDetail?paperid=${paper.paperId}&source=${source}`}
                className="recommended-paper"
                style={{ textDecoration: 'none', color: 'blue' }}
              >
                {paper.title}
              </Link>
              </li>
            ))}
          </ul>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };
  
  export default AuthorPopup;
  
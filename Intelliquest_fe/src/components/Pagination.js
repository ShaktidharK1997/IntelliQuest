import './Pagination.css'
const Pagination = ({ resultsPerPage, totalResults, paginate }) => {
    const pageNumbers = [];
  
    for (let i = 1; i <= Math.ceil(totalResults / resultsPerPage); i++) {
      pageNumbers.push(i);
    }
  
    return (
      <nav aria-label="Page navigation example">
        <ul className='pagination'>
          {pageNumbers.map(number => (
            <li key={number} className='page-item'>
              <button 
                onClick={() => paginate(number)}
                className='page-link'
                style={{ border: 'none', background: 'none' }}  // Optional: style directly here or use your CSS classes
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
    
  };
  

  export default Pagination;
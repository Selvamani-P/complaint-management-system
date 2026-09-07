import React from "react";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ""
}) {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={`pagination ${className}`}>
      <button
        type="button"
        className="pagination-button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <div className="page-numbers">
        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            className={`pagination-number ${currentPage === page ? "active" : ""}`}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="pagination-button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  );
}

export default Pagination;

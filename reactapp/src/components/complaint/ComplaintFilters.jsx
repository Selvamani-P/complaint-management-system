import React from "react";

export function ComplaintFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  sortOrder,
  onSortChange,
  categories = [],
  onClear
}) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search complaints..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
        data-testid="search-input"
      />

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="form-select"
        data-testid="status-filter"
      >
        <option value="ALL">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="ASSIGNED">Assigned</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
        <option value="CLOSED">Closed</option>
      </select>

      {onCategoryChange && (
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="form-select"
        >
          <option value="ALL">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {onSortChange && (
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="form-select"
        >
          <option value="NEWEST">Newest First</option>
          <option value="OLDEST">Oldest First</option>
          <option value="TITLE_ASC">Title A-Z</option>
          <option value="TITLE_DESC">Title Z-A</option>
        </select>
      )}

      {onClear && (
        <button
          type="button"
          className="secondary-button"
          onClick={onClear}
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default ComplaintFilters;

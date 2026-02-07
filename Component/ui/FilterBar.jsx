import React from "react";
import "./ui.css";

/**
 * Reusable filter bar: optional search + optional select filters.
 * Uses existing .filters class for layout; add filter-bar class for consistency.
 */
const FilterBar = ({
  searchPlaceholder = "Search by ID or title",
  searchValue = "",
  onSearchChange,
  statusOptions = [],
  statusValue = "",
  onStatusChange,
  priorityOptions = [],
  priorityValue = "",
  onPriorityChange,
  requestTypeOptions = [],
  requestTypeValue = "",
  onRequestTypeChange,
  showSearch = true,
  showStatus = true,
  showPriority = true,
  showRequestType = true,
  statusAllLabel = "All Status",
  priorityAllLabel = "All Priority",
  requestTypeAllLabel = "All Request Types",
  clearSearchButton = false,
  onClearSearch,
}) => (
  <div className="filters">
    {showSearch && (
      <div className="search-wrapper">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="search-input"
        />
        {clearSearchButton && searchValue && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => onClearSearch?.()}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    )}
    {showStatus && (
      <select value={statusValue} onChange={(e) => onStatusChange?.(e.target.value)}>
        <option value="">{statusAllLabel}</option>
        {statusOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    )}
    {showPriority && (
      <select value={priorityValue} onChange={(e) => onPriorityChange?.(e.target.value)}>
        <option value="">{priorityAllLabel}</option>
        {priorityOptions.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    )}
    {showRequestType && (
      <select value={requestTypeValue} onChange={(e) => onRequestTypeChange?.(e.target.value)}>
        <option value="">{requestTypeAllLabel}</option>
        {requestTypeOptions.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    )}
  </div>
);

export default FilterBar;

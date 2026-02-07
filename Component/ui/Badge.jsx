import React from "react";
import "./ui.css";

/**
 * Reusable badge for status, priority, or role.
 * @param {object} props
 * @param {string} props.children - Label text
 * @param {'status'|'priority'|'role'} [props.variant] - Visual variant
 * @param {string} [props.value] - Optional value used for extra class (e.g. "open", "high")
 * @param {string} [props.className] - Additional class names
 */
const Badge = ({ children, variant = "status", value = "", className = "" }) => {
  const normalized = (value || children || "").toString().toLowerCase().replace(/\s/g, "");
  return (
    <span
      className={`ui-badge ui-badge--${variant} ${normalized ? `ui-badge--${normalized}` : ""} ${className}`.trim()}
      role="status"
    >
      {children}
    </span>
  );
};

export default Badge;

import React from "react";
import "./ui.css";

/**
 * Loading, error, or empty message so pages don't repeat the same markup.
 */
export function LoadingState({ message = "Loading…" }) {
  return <p className="center-text ui-page-state ui-page-state--loading">{message}</p>;
}

export function ErrorState({ message }) {
  if (!message) return null;
  return <p className="center-text ui-page-state ui-page-state--error">{message}</p>;
}

export function EmptyState({ message = "No items found" }) {
  return <p className="center-text ui-page-state ui-page-state--empty">{message}</p>;
}

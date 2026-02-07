import React from "react";
import Badge from "../ui/Badge";

/**
 * Normalize ticket field names (API may return request_type or requestType).
 */
const getRequestType = (t) => t?.requestType ?? t?.request_type ?? "—";
const getPriority = (t) => t?.priority ?? "—";
const getStatus = (t) => t?.status ?? "—";

/**
 * Reusable ticket card. Renders ID, title, status, priority, type, assignedTo, dates.
 * Optional: actions (buttons), status dropdown, description snippet.
 */
const TicketCard = ({
  ticket,
  titleLabel = "Problem",
  showDescription = false,
  descriptionMaxLength = 120,
  statusSelectValue,
  statusOptions = [],
  onStatusChange,
  actions,
  children,
}) => {
  const id = ticket?.id;
  const title = ticket?.title ?? "Untitled";
  const status = getStatus(ticket);
  const priority = getPriority(ticket);
  const requestType = getRequestType(ticket);
  const assignedTo = ticket?.assignedTo?.name ?? "—";
  const createdAt = ticket?.createdAt ? new Date(ticket.createdAt).toLocaleString() : "—";
  const dueDate = ticket?.dueDate ? new Date(ticket.dueDate).toLocaleString() : "—";
  const description = ticket?.description
    ? ticket.description.length > descriptionMaxLength
      ? ticket.description.slice(0, descriptionMaxLength) + "..."
    : ticket.description
    : "No description";

  return (
    <div className="ticket-card" data-ticket-id={id}>
      <div className="ticket-header">
        <span className="ticket-id">#{id}</span>
        <Badge variant="status" value={status}>{status}</Badge>
      </div>

      <h3 className="ticket-title">
        <strong>{titleLabel}:</strong> {title}
      </h3>

      {showDescription && (
        <p className="ticket-description">
          <strong>Description: </strong>{description}
        </p>
      )}

      <p className="ticket-info">
        <strong>Type:</strong> {requestType}
        <br />
        <strong>Priority:</strong> <Badge variant="priority" value={priority}>{priority}</Badge>
        <br />
        <strong>Assigned To:</strong> {assignedTo}
      </p>

      <p className="ticket-date">
        <strong>Created:</strong> {createdAt}
      </p>
      <p className="ticket-date">
        <strong>Due Date:</strong> {dueDate}
      </p>

      {onStatusChange && statusOptions.length > 0 && (
        <div className="status-update">
          <select
            value={statusSelectValue ?? status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {actions}
      {children}
    </div>
  );
};

export default TicketCard;

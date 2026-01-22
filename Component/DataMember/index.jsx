import React, { useState, useEffect } from "react";

const AssignedTickets = ({ goToDashboard }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [auditHistory, setAuditHistory] = useState([]);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  const statusOptions = ["OPEN", "INPROGRESS", "ONHOLD", "COMPLETED", "REJECTED"];

  // ------------------- FETCH TICKETS -------------------
  useEffect(() => {
    if (!userId || !token) {
      setError("User ID or token missing. Please login again.");
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/tickets/assigned-to/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.status}`);
        const data = await res.json();

        const ticketsWithComments = await Promise.all(
          data.map(async (ticket) => {
            const resComments = await fetch(
              `http://localhost:8080/api/tickets/${ticket.id}/comments`,
              { headers: { Authorization: `Bearer ${token}`, "user-id": userId } }
            );
            const comments = await resComments.json();
            return { ...ticket, comments };
          })
        );

        setTickets(ticketsWithComments);

        // Select first ticket by default
        if (ticketsWithComments.length > 0) setSelectedTicketId(ticketsWithComments[0].id);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId, token]);

  // ------------------- FETCH AUDIT HISTORY -------------------
  const fetchAuditHistory = async (ticketId) => {
    if (!ticketId) return;
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/audit/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch audit: ${res.status}`);
      const data = await res.json();
      setAuditHistory(data);
    } catch (err) {
      console.error(err);
      setAuditHistory([]);
    }
  };

  useEffect(() => {
    if (selectedTicketId) fetchAuditHistory(selectedTicketId);
  }, [selectedTicketId, token]);

  // ------------------- UPDATE STATUS -------------------
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${ticketId}/status?status=${newStatus}&userId=${userId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      const updatedTicket = await res.json();

      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: updatedTicket.status } : t))
      );

      // REFRESH audit log
      if (ticketId === selectedTicketId) fetchAuditHistory(ticketId);
    } catch (err) {
      console.error(err);
      alert("Error updating status: " + err.message);
    }
  };

  // ------------------- ADD COMMENT -------------------
  const handleAddComment = async () => {
    if (!selectedTicketId || !newComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${selectedTicketId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "user-id": userId,
          },
          body: JSON.stringify({ comment: newComment, visibility: "internal" }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const addedComment = await res.json();

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId
            ? { ...t, comments: [...t.comments, addedComment] }
            : t
        )
      );
      setNewComment("");

      // REFRESH audit log
      fetchAuditHistory(selectedTicketId);
    } catch (err) {
      console.error(err);
      alert("Error adding comment: " + err.message);
    }
  };

  if (loading) return <p>Loading tickets...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!tickets.length) return <p>No tickets assigned.</p>;

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={goToDashboard}>⬅ Back to Dashboard</button>
      <h2>My Assigned Tickets</h2>

      {/* Select Ticket */}
      <div style={{ marginBottom: "10px" }}>
        <label>Select Ticket: </label>
        <select
          value={selectedTicketId || ""}
          onChange={(e) => setSelectedTicketId(Number(e.target.value))}
        >
          <option value="" disabled>
            -- Select Ticket --
          </option>
          {tickets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets Table */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Internal Comments</th>
            <th>Requester-visible Comments</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.description}</td>
              <td>
                <select
                  value={ticket.status || "OPEN"}
                  onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {ticket.comments
                  .filter((c) => c.visibility === "internal")
                  .map((c) => (
                    <div key={c.id}>{c.comment}</div>
                  ))}
              </td>
              <td>
                {ticket.comments
                  .filter((c) => c.visibility === "requester")
                  .map((c) => (
                    <div key={c.id}>{c.comment}</div>
                  ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Comment */}
      {selectedTicketId && (
        <div style={{ marginTop: "20px" }}>
          <h3>Add Internal Comment</h3>
          <textarea
            rows="3"
            cols="50"
            placeholder="Write your comment here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <br />
          <button onClick={handleAddComment} style={{ marginTop: "5px" }}>
            Add Comment
          </button>
        </div>
      )}

      {/* Audit History */}
      {selectedTicketId && auditHistory.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h3>Ticket Audit History</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Action</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Updated By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditHistory.map((h) => (
                <tr key={h.id}>
                  <td>{h.action}</td>
                  <td>{h.oldValue || "-"}</td>
                  <td>{h.newValue || "-"}</td>
                  <td>{h.updatedBy || "-"}</td>
                  <td>{new Date(h.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedTickets;

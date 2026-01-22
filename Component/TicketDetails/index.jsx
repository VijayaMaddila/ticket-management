import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TicketDetails = () => {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch ticket details");
        const data = await res.json();
        setTicket(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTicket();
    fetchComments();
  }, [id, token]);

  // Add new comment
  const handleAddComment = async () => {
    if (!newComment) return;

    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      const data = await res.json();
      setComments((prev) => [...prev, data]);
      setNewComment("");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading ticket details...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!ticket) return <p>No ticket found</p>;

  const getPriorityClass = (priority) => `priority ${priority.toLowerCase()}`;
  const getStatusClass = (status) => `status ${status.toLowerCase()}`;

  return (
    <div className="ticket-details-container">
      <h2>Ticket Details</h2>
      <button onClick={() => navigate("/")}>⬅ Back to Dashboard</button>

      <div className="ticket-info">
        <p><strong>Title:</strong> {ticket.title}</p>
        <p><strong>Description:</strong> {ticket.description}</p>
        <p><strong>Request Type:</strong> {ticket.request_type}</p>
        <p>
          <strong>Priority:</strong>{" "}
          <span className={getPriorityClass(ticket.priority)}>{ticket.priority}</span>
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={getStatusClass(ticket.status)}>{ticket.status}</span>
        </p>
        <p><strong>Requester:</strong> {ticket.requester?.email}</p>
        <p><strong>Assigned To:</strong> {ticket.assignedTo?.email || "Not assigned"}</p>
        <p><strong>Created At:</strong> {new Date(ticket.createdAt).toLocaleString()}</p>
        <p><strong>Updated At:</strong> {new Date(ticket.updatedAt).toLocaleString()}</p>
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {comments.length === 0 && <p>No comments yet.</p>}
        {comments.map((c, idx) => (
          <p key={idx}>
            <strong>{c.createdBy || "Anonymous"}:</strong> {c.comment || c.text}
          </p>
        ))}

        <div className="add-comment">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Add Comment</button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;

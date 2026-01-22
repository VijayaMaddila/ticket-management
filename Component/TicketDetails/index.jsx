import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./index.css";

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ticketRes = await fetch(`http://localhost:8080/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ticketRes.ok) throw new Error("Failed to fetch ticket");
        setTicket(await ticketRes.json());

        const commentsRes = await fetch(
          `http://localhost:8080/api/tickets/${id}/comments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (commentsRes.ok) setComments(await commentsRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  if (loading) return <div className="center-text">Loading ticket details...</div>;
  if (error) return <div className="center-text error">{error}</div>;
  if (!ticket) return <div className="center-text">Ticket not found</div>;

  return (
    <div className="ticket-details-page">
      <button className="back-btn" onClick={() => navigate("/")}>
        ⬅ Back to Dashboard
      </button>

      {/* Ticket Summary */}
      <div className="ticket-card">
        <div className="ticket-header">
          <h2>{ticket.title}</h2>
          <span className={`badge status ${ticket.status?.toLowerCase()}`}>
            {ticket.status}
          </span>
        </div>

        <p className="description">{ticket.description}</p>

        <div className="meta-grid">
          <div>
            <label>Request Type</label>
            <p>{ticket.requestType}</p>
          </div>

          <div>
            <label>Priority</label>
            <span className={`badge priority ${ticket.priority?.toLowerCase()}`}>
              {ticket.priority}
            </span>
          </div>

          <div>
            <label>Requester</label>
            <p>{ticket.requester?.email}</p>
          </div>

          <div>
            <label>Assigned To</label>
            <p>{ticket.assignedTo?.email || "Not Assigned"}</p>
          </div>

          <div>
            <label>Created</label>
            <p>{new Date(ticket.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <label>Last Updated</label>
            <p>{new Date(ticket.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      
      </div>
  
  );
};

export default TicketDetails;

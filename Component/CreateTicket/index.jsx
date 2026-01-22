import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const CreateTicket = ({ user }) => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestType, setRequestType] = useState("ACCESS");
  const [priority, setPriority] = useState("LOW");
  const [requestedDataset, setRequestedDataset] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          requestType,
          priority,
          requestedDataset,
          requester: { id: user.id },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to create ticket");
      }

      setSuccess("🎉 Ticket created successfully!");

      setTitle("");
      setDescription("");
      setRequestType("ACCESS");
      setPriority("LOW");
      setRequestedDataset("");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-ticket-wrapper">
      <div className="create-ticket-card">
        <h2>Create New Ticket</h2>
        <p className="subtitle">Submit a request to the data team</p>

        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the request"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain your request in detail"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Request Type</label>
              <select value={requestType} onChange={(e) => setRequestType(e.target.value)}>
                <option value="ACCESS">Access</option>
                <option value="REPORT">Report</option>
                <option value="BUG">Bug</option>
                <option value="PIPELINE">Pipeline</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Requested Dataset (optional)</label>
            <input
              type="text"
              value={requestedDataset}
              onChange={(e) => setRequestedDataset(e.target.value)}
              placeholder="Dataset name or ID"
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn primary">
              Create Ticket
            </button>
            <button type="button" className="btn secondary" onClick={() => navigate("/")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;

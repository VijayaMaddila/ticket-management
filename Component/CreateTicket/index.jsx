import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTicket = ({ user }) => {
  const navigate = useNavigate(); // 👈 useNavigate here

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

      setSuccess("Ticket created successfully!");

      // reset form
      setTitle("");
      setDescription("");
      setRequestType("ACCESS");
      setPriority("LOW");
      setRequestedDataset("");

      // ✅ Redirect after success (delay optional)
      setTimeout(() => {
        navigate("/"); // dashboard
      }, 1000);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Ticket</h2>

      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label><br />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Description</label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Request Type</label><br />
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            <option value="ACCESS">ACCESS</option>
            <option value="REPORT">REPORT</option>
            <option value="BUG">BUG</option>
            <option value="PIPELINE">PIPELINE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>

        <div>
          <label>Priority</label><br />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>

        <div>
          <label>Requested Dataset</label><br />
          <input
            value={requestedDataset}
            onChange={(e) => setRequestedDataset(e.target.value)}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <button type="submit">Create Ticket</button>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;

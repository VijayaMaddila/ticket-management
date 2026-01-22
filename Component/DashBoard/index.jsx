import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";

  // Fetch tickets
  useEffect(() => {
    if (!token) navigate("/login");

    fetch("http://localhost:8080/api/tickets", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tickets");
        return res.json();
      })
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, navigate]);

  // Fetch comments for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;

    fetch(`http://localhost:8080/api/comments/ticket/${selectedTicket.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setComments(data))
      .catch((err) => console.error(err));
  }, [selectedTicket, token]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleAddComment = () => {
    if (!newComment || !selectedTicket) return;

    fetch(`http://localhost:8080/api/comments/ticket/${selectedTicket.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ comment: newComment }),
    })
      .then((res) => res.json())
      .then((data) => {
        setComments((prev) => [...prev, data]);
        setNewComment("");
      })
      .catch((err) => alert(err.message));
  };

  const filteredTickets = tickets.filter((t) => {
    return (
      (!searchTerm ||
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toString().includes(searchTerm)) &&
      (!priorityFilter ||
        t.priority.toLowerCase() === priorityFilter.toLowerCase()) &&
      (!requestTypeFilter ||
        t.request_type.toLowerCase() === requestTypeFilter.toLowerCase()) &&
      (!assignedFilter ||
        (t.assignedTo?.name || "Unassigned").toLowerCase() ===
          assignedFilter.toLowerCase())
    );
  });

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "high":
        return "#f44336";
      case "critical":
        return "#d50000";
      default:
        return "#9e9e9e";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "#2196f3";
      case "in_progress":
        return "#ffc107";
      case "on_hold":
        return "#9c27b0";
      case "completed":
        return "#4caf50";
      case "rejected":
        return "#f44336";
      default:
        return "#9e9e9e";
    }
  };

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px", color: "#555" }}>
        Loading tickets...
      </p>
    );
  if (error)
    return (
      <p
        style={{ textAlign: "center", color: "red", marginTop: "50px" }}
      >
        {error}
      </p>
    );

  const assignedUsers = [
    ...new Set(tickets.map((t) => t.assignedTo?.name || "Unassigned")),
  ];
  const priorities = [...new Set(tickets.map((t) => t.priority))];
  const requestTypes = [...new Set(tickets.map((t) => t.request_type))];

  return (
    <div
      style={{
        padding: "20px 30px",
        fontFamily: "'Segoe UI', sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(to right, #ece9e6, #ffffff)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ margin: 0, color: "#2c3e50" }}>Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#e74c3c",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <input
          type="text"
          placeholder="Search by ID or Title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: "1 1 200px",
            padding: "10px 15px",
            borderRadius: "25px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        />
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: "10px 15px",
            borderRadius: "25px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <option value="">All Priority</option>
          {priorities.map((p, i) => (
            <option key={i} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={requestTypeFilter}
          onChange={(e) => setRequestTypeFilter(e.target.value)}
          style={{
            padding: "10px 15px",
            borderRadius: "25px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <option value="">All Request Types</option>
          {requestTypes.map((r, i) => (
            <option key={i} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          style={{
            padding: "10px 15px",
            borderRadius: "25px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          }}
        >
          <option value="">All Assigned Users</option>
          {assignedUsers.map((u, i) => (
            <option key={i} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>

      {/* Tickets Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "20px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onClick={() => setSelectedTicket(ticket)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "translateY(-5px)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  color: "#2c3e50",
                  fontWeight: "600",
                }}
              >
                {ticket.title}
              </h3>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: getPriorityColor(ticket.priority),
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                {ticket.priority}
              </span>
            </div>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#555" }}>
              ID: {ticket.id}
            </p>
            <p style={{ margin: "4px 0", fontSize: "13px", color: "#555" }}>
              Type: {ticket.request_type}
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "15px",
              }}
            >
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  background: getStatusColor(ticket.status),
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                {ticket.status}
              </span>
              {/* Assigned Circle */}
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  background: "#3498db",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                {ticket.assignedTo?.name?.charAt(0).toUpperCase() || "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Modal */}
      {selectedTicket && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#fff",
              borderRadius: "15px",
              padding: "20px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#2c3e50" }}>
              {selectedTicket.title} - Comments
            </h3>
            <div style={{ marginBottom: "15px" }}>
              {comments.length > 0
                ? comments.map((c) => (
                    <p key={c.id}>
                      <strong>{c.createdBy?.name || "Unknown"}:</strong>{" "}
                      {c.comment}
                    </p>
                  ))
                : "No comments yet."}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment"
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "25px",
                  border: "1px solid #ccc",
                  outline: "none",
                }}
              />
              <button
                onClick={handleAddComment}
                style={{
                  padding: "10px 20px",
                  borderRadius: "25px",
                  border: "none",
                  background: "#2ecc71",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Add
              </button>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "25px",
                  border: "none",
                  background: "#e74c3c",
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";

const AssignedTickets = ({ goToDashboard }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [auditHistory, setAuditHistory] = useState([]);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [usersMap, setUsersMap] = useState({}); 

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  const statusOptions = ["ALL", "OPEN", "INPROGRESS", "ONHOLD", "COMPLETED", "REJECTED"];
  const priorityOptions = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Users fetch failed");
        const users = await res.json();
        const map = {};
        users.forEach(u => {
          map[u.id] = u.name || u.username || `User-${u.id}`;
        });
        setUsersMap(map);
      } catch (err) {
        console.warn("Could not load users for names:", err);
      }
    };

    if (token) fetchUsers();
  }, [token]);

 
  useEffect(() => {
    if (!userId || !token) {
      setError("Authentication missing. Please login again.");
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8080/api/tickets/assigned-to/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const ticketsWithComments = await Promise.all(
          data.map(async (ticket) => {
            const resComments = await fetch(
              `http://localhost:8080/api/tickets/${ticket.id}/comments`,
              { headers: { Authorization: `Bearer ${token}`, "user-id": userId } }
            );
            const comments = resComments.ok ? await resComments.json() : [];
            return { ...ticket, comments };
          })
        );

        setTickets(ticketsWithComments);
        setFilteredTickets(ticketsWithComments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId, token]);


  useEffect(() => {
    let result = [...tickets];
    if (statusFilter !== "ALL") result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== "ALL") result = result.filter(t => t.priority === priorityFilter);
    setFilteredTickets(result);
  }, [statusFilter, priorityFilter, tickets]);

  const fetchAudit = async (ticketId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/audit/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Audit fetch failed");
      const data = await res.json();
      setAuditHistory(data || []);
    } catch (err) {
      console.error(err);
      setAuditHistory([]);
    }
  };

  const openAudit = (ticket) => {
    setSelectedTicket(ticket);
    fetchAudit(ticket.id);
    setShowAuditModal(true);
  };

  
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "—";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };


  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${selectedTicket.id}/status?status=${newStatus}&userId=${userId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();

      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: updated.status } : t));
      setSelectedTicket(prev => ({ ...prev, status: updated.status }));
    } catch (err) {
      alert("Status update failed: " + err.message);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !newComment.trim()) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${selectedTicket.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "user-id": userId,
          },
          body: JSON.stringify({ comment: newComment, visibility: "internal" }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const added = await res.json();

      setTickets(prev =>
        prev.map(t =>
          t.id === selectedTicket.id ? { ...t, comments: [...(t.comments || []), added] } : t
        )
      );
      setSelectedTicket(prev => ({
        ...prev,
        comments: [...(prev.comments || []), added],
      }));
      setNewComment("");
    } catch (err) {
      alert("Failed to add comment: " + err.message);
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setNewComment("");
  };

  const closeAuditModal = () => setShowAuditModal(false);

  if (loading) return <div style={{ textAlign: "center", padding: "4rem" }}>Loading tickets...</div>;
  if (error) return <div style={{ color: "#dc2626", textAlign: "center", padding: "2rem" }}>{error}</div>;

  return (
    <>
      <style>{`
        .chip {
          padding: 0.45rem 1rem;
          border-radius: 999px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.18s;
          border: 1px solid #d1d5db;
          background: #f9fafb;
        }
        .chip.active {
          background: #3b82f6;
          color: white;
          border-color: #2563eb;
        }
        .chip:hover:not(.active) {
          background: #e5e7eb;
        }

        .audit-table th, .audit-table td {
          padding: 0.9rem 1.1rem;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        .audit-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #4b5563;
          text-transform: uppercase;
          font-size: 0.82rem;
          letter-spacing: 0.4px;
        }
        .audit-table tr:hover {
          background: #f1f5f9;
        }
      `}</style>

      <div style={{ padding: "1.5rem", maxWidth: "1440px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.8rem" }}>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 700, margin: 0 }}>Assigned Tickets</h1>
          <button
            onClick={goToDashboard}
            style={{ padding: "0.7rem 1.5rem", background: "#1f2937", color: "white", border: "none", borderRadius: "8px" }}
          >
            ← Dashboard
          </button>
        </div>

      
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ marginBottom: "0.8rem", fontWeight: 500, color: "#4b5563" }}>Filter by Status</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.2rem" }}>
            {statusOptions.map(s => (
              <div
                key={s}
                className={`chip ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "All Statuses" : s}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "0.8rem", fontWeight: 500, color: "#4b5563" }}>Filter by Priority</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {priorityOptions.map(p => (
              <div
                key={p}
                className={`chip ${priorityFilter === p ? "active" : ""}`}
                onClick={() => setPriorityFilter(p)}
              >
                {p === "ALL" ? "All Priorities" : p}
              </div>
            ))}
          </div>
        </div>

      
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {filteredTickets.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              style={{
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1.4rem",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <h3 style={{ margin: "0 0 0.9rem", fontSize: "1.25rem" }}>{t.title}</h3>
              <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                <span style={{
                  padding: "0.4rem 1rem",
                  borderRadius: "999px",
                  fontSize: "0.88rem",
                  background: t.status === "COMPLETED" ? "#dcfce7" : t.status === "REJECTED" ? "#fee2e2" : "#f1f5f9",
                  color: t.status === "COMPLETED" ? "#166534" : t.status === "REJECTED" ? "#991b1b" : "#334155",
                }}>
                  {t.status}
                </span>
                <span style={{ padding: "0.4rem 1rem", borderRadius: "999px", fontSize: "0.88rem", background: "#dbeafe", color: "#1e40af" }}>
                  {t.priority}
                </span>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.96rem", lineHeight: 1.5, margin: 0 }}>
                {t.description?.substring(0, 140)}{t.description?.length > 140 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

  
      {selectedTicket && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }} onClick={closeModal}>
          <div style={{
            background: "white", borderRadius: "12px", width: "min(92%, 920px)",
            maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: "1.4rem 2rem",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: "white",
              zIndex: 10,
            }}>
              <h2 style={{ margin: 0, fontSize: "1.6rem" }}>{selectedTicket.title}</h2>
              <button onClick={closeModal} style={{ fontSize: "2rem", color: "#64748b", background: "none", border: "none" }}>×</button>
            </div>

            <div style={{ padding: "1.8rem 2rem" }}>
              <p style={{ color: "#334155", lineHeight: 1.6, margin: "0 0 2rem" }}>{selectedTicket.description || "No description provided."}</p>

              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, color: "#475569", marginBottom: "0.5rem" }}>Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    style={{
                      padding: "0.7rem 1.2rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      minWidth: "180px",
                    }}
                  >
                    {statusOptions.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <button
                  onClick={() => openAudit(selectedTicket)}
                  title="View Audit Log"
                  style={{
                    padding: "0.7rem 1.1rem",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.05rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.3rem" }}>📜</span> Audit Log
                </button>
              </div>

          
              <h3 style={{ margin: "0 0 1.2rem", fontSize: "1.25rem", color: "#1e293b" }}>Comments</h3>

              {selectedTicket.comments?.length > 0 ? (
                selectedTicket.comments.map(c => (
                  <div key={c.id} style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "1.1rem",
                    marginBottom: "1.2rem",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                      <strong style={{ color: "#1e293b" }}>{c.createdBy?.name || "Unknown"}</strong>
                      <span style={{ color: "#64748b", fontSize: "0.9rem" }} title={new Date(c.createdAt).toLocaleString()}>
                        {getRelativeTime(c.createdAt)}
                      </span>
                    </div>
                    <div style={{
                      display: "inline-block",
                      padding: "0.25rem 0.8rem",
                      background: "#e0e7ff",
                      color: "#4338ca",
                      borderRadius: "999px",
                      fontSize: "0.82rem",
                      marginBottom: "0.6rem",
                    }}>
                      {c.visibility}
                    </div>
                    <p style={{ margin: 0, color: "#334155" }}>{c.comment}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: "2.5rem 0" }}>No comments yet.</p>
              )}

              <div style={{ marginTop: "2rem", borderTop: "1px solid #e2e8f0", paddingTop: "1.6rem" }}>
                <textarea
                  rows={4}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add internal comment..."
                  style={{
                    width: "100%",
                    padding: "0.9rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    resize: "vertical",
                    marginBottom: "1rem",
                  }}
                />
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    style={{
                      padding: "0.75rem 1.6rem",
                      background: newComment.trim() ? "#2563eb" : "#cbd5e1",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: newComment.trim() ? "pointer" : "not-allowed",
                      fontSize: "1rem",
                    }}
                  >
                    Submit Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {showAuditModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
        }} onClick={closeAuditModal}>
          <div style={{
            background: "white", borderRadius: "12px", width: "min(92%, 860px)",
            maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: "1.3rem 2rem",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h3 style={{ margin: 0, fontSize: "1.35rem" }}>Audit Log – {selectedTicket?.title}</h3>
              <button onClick={closeAuditModal} style={{ fontSize: "1.8rem", color: "#64748b", background: "none", border: "none" }}>×</button>
            </div>

            <div style={{ padding: "1.6rem 2rem" }}>
              {auditHistory.length > 0 ? (
                <table className="audit-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Old Value</th>
                      <th>New Value</th>
                      <th>Changed By</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditHistory.map(h => (
                      <tr key={h.id}>
                        <td>{h.action}</td>
                        <td>{h.oldValue || "—"}</td>
                        <td>{h.newValue || "—"}</td>
                        <td>{usersMap[h.updatedBy] || h.updatedBy || "—"}</td>
                        <td title={new Date(h.timestamp).toLocaleString()}>
                          {getRelativeTime(h.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "4rem 0" }}>
                  No audit entries found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignedTickets;
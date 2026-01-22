import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = storedUser?.token;

  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTicket, setSelectedTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
    fetchTickets();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(await res.json());
    } catch {
      setError("Failed to load users");
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(await res.json());
    } catch {
      setError("Failed to load tickets");
    }
  };

  const updateRole = async (id, role) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${id}/role?role=${role}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setSuccess("Role updated successfully");
      fetchUsers();
    } catch {
      setError("Role update failed");
    }
  };

  const assignTicket = async () => {
    if (!selectedTicket || !selectedUser) {
      setError("Please select ticket and data member");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${selectedTicket}/assign/${selectedUser}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error();
      setSuccess("Ticket assigned successfully");
      setSelectedTicket("");
      setSelectedUser("");
      fetchTickets();
    } catch {
      setError("Assignment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <button className="back-btn" onClick={() => navigate("/")}>
          ⬅ Back to Dashboard
        </button>

        <h2>Admin Panel</h2>

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        
        <h3>Users Management</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>
                      {u.role.toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                    >
                      <option value="REQUESTER">Requester</option>
                      <option value="DATAMEMBER">Data Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        
        <h3>Assign Ticket</h3>
        <div className="assign-box">
          <select
            value={selectedTicket}
            onChange={(e) => setSelectedTicket(e.target.value)}
          >
            <option value="">Select Ticket</option>
            {tickets
              .filter((t) => t.status === "OPEN")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Select Data Member</option>
            {users
              .filter((u) => u.role.toLowerCase() === "datamember")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>

          <button onClick={assignTicket} disabled={loading}>
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

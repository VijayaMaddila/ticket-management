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

  /* -------------------- AUTH CHECK -------------------- */
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchUsers();
    fetchTickets();
  }, [token]);

  /* -------------------- FETCH USERS -------------------- */
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    }
  };

  /* -------------------- FETCH TICKETS -------------------- */
  const fetchTickets = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTickets(data);
    } catch {
      setError("Failed to load tickets");
    }
  };

  /* -------------------- UPDATE ROLE -------------------- */
  const updateRole = async (userId, role) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/users/${userId}/role?role=${role}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Role update failed");

      setSuccess("Role updated successfully");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  /* -------------------- ASSIGN TICKET -------------------- */
  const assignTicket = async () => {
    if (!selectedTicket || !selectedUser) {
      setError("Select ticket and data member");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/api/tickets/${selectedTicket}/assign/${selectedUser}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Assignment failed");

      setSuccess("Ticket assigned successfully");
      setSelectedTicket("");
      setSelectedUser("");
      fetchTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="admin-container">
      <button onClick={() => navigate("/")}>⬅ Back</button>
      <h2>Admin Panel</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      {/* -------- USERS -------- */}
      <h3>Users</h3>
      <table border="1" width="100%" cellPadding="10">
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
              <td>{u.role}</td>
              <td>
                <select
                  defaultValue={u.role}
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

      {/* -------- ASSIGN TICKET -------- */}
      <h3>Assign Ticket</h3>

      <select
        value={selectedTicket}
        onChange={(e) => setSelectedTicket(e.target.value)}
      >
        <option value="">-- Select Ticket --</option>
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
        style={{ marginLeft: "10px" }}
      >
        <option value="">-- Select Data Member --</option>
        {users
          .filter((u) => u.role === "DATAMEMBER")
          .map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
      </select>

      <button
        onClick={assignTicket}
        disabled={loading}
        style={{ marginLeft: "10px" }}
      >
        {loading ? "Assigning..." : "Assign"}
      </button>
    </div>
  );
};

export default AdminPanel;

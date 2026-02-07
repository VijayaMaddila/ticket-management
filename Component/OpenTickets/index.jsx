import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPut, API_BASE_URL, getAuthHeaders } from "../../src/config/api";
import DashboardLayout from "../ui/DashboardLayout";
import FilterBar from "../ui/FilterBar";
import TicketCard from "../tickets/TicketCard";
import Modal from "../ui/Modal";
import { LoadingState, ErrorState, EmptyState } from "../ui/PageState";
import "./index.css";

const OpenTickets = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase() || "";
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState("");

  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const fetchTickets = async () => {
    try {
      const data = await apiGet("/api/tickets", { token });
      let openTickets = data.filter((t) => (t.status || "").toLowerCase() === "open");
      if (role === "requester") {
        openTickets = openTickets.filter((t) => t.requester?.id === user.id);
      }
      setTickets(openTickets);
      setFilteredTickets(openTickets);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiGet("/api/users", { token });
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchUsers();
  }, []);

  useEffect(() => {
    const normalize = (v) => (v ?? "").toString().toLowerCase();
    let result = [...tickets];
    if (searchTerm) {
      const term = normalize(searchTerm);
      result = result.filter(
        (t) => normalize(t.id).includes(term) || normalize(t.title).includes(term)
      );
    }
    if (priorityFilter) result = result.filter((t) => normalize(t.priority) === normalize(priorityFilter));
    if (requestTypeFilter) result = result.filter((t) => normalize(t.request_type || t.requestType) === normalize(requestTypeFilter));
    setFilteredTickets(result);
  }, [tickets, searchTerm, priorityFilter, requestTypeFilter]);

  useEffect(() => {
    if (showAssignModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [showAssignModal]);

  const assignTicket = async () => {
    if (!selectedTicket || !selectedUserId) return;
    setAssigning(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/tickets/${selectedTicket.id}/assign/${selectedUserId}`,
        { method: "PUT", headers: getAuthHeaders(token) }
      );
      if (!res.ok) throw new Error("Assignment failed");
      await fetchTickets();
      setAssignSuccess("Assigned successfully");
      setTimeout(() => setAssignSuccess(""), 2000);
      setShowAssignModal(false);
      setSelectedUserId("");
    } catch (err) {
      alert(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await apiPut(
        `/api/tickets/${ticketId}/status?status=${newStatus}&userId=${user.id}`,
        null,
        { token }
      );
      const data = await apiGet("/api/tickets", { token });
      setTickets(data.filter((t) => (t.status || "").toLowerCase() === "open"));
    } catch (err) {
      console.error(err);
      alert("Error updating ticket status");
    }
  };

  const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];
  const priorities = [...new Set(tickets.map((t) => t.priority).filter(Boolean))];
  const requestTypes = [...new Set(tickets.map((t) => t.request_type || t.requestType).filter(Boolean))];
  const dataMembers = users.filter((u) => (u.role || "").toLowerCase() === "datamember");
  const filteredUsers = userSearch
    ? dataMembers.filter((u) =>
        `${u.name || ""} ${u.email || ""}`.toLowerCase().includes(userSearch.toLowerCase())
      )
    : dataMembers;

  if (loading) return <LoadingState message="Loading tickets..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <DashboardLayout title="Open Tickets">
      <span className="ticket-count">{filteredTickets.length} Tickets</span>
      <FilterBar
        searchPlaceholder="Search by ID or Title"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        showStatus={false}
        statusOptions={[]}
        statusValue=""
        onStatusChange={() => {}}
        priorityOptions={priorities}
        priorityValue={priorityFilter}
        onPriorityChange={setPriorityFilter}
        requestTypeOptions={requestTypes}
        requestTypeValue={requestTypeFilter}
        onRequestTypeChange={setRequestTypeFilter}
        priorityAllLabel="All Priorities"
        requestTypeAllLabel="All Request Types"
      />
      <div className="tickets-grid">
        {filteredTickets.length === 0 ? (
          <EmptyState message="No open tickets found" />
        ) : (
          filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              showDescription={false}
              statusOptions={statusOptions}
              onStatusChange={role !== "requester" ? handleStatusChange : undefined}
              statusSelectValue={ticket.status}
            >
              {role !== "requester" && (
                <button
                  className="assign-btn"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setSelectedUserId("");
                    setUserSearch("");
                    setShowAssignModal(true);
                  }}
                >
                  Assign
                </button>
              )}
            </TicketCard>
          ))
        )}
      </div>

      <Modal
        isOpen={!!showAssignModal && !!selectedTicket}
        onClose={() => setShowAssignModal(false)}
        title="Assign Ticket"
        className="assign-modal"
      >
        <div className="assign-details">
          <div>
            <p><strong>ID:</strong> #{selectedTicket?.id}</p>
            <p><strong>Title:</strong> {selectedTicket?.title}</p>
            <p><strong>Type:</strong> {selectedTicket?.request_type || selectedTicket?.requestType}</p>
          </div>
          <div>
            <p><strong>Priority:</strong> {selectedTicket?.priority}</p>
            <p><strong>Current:</strong> {selectedTicket?.assignedTo?.name || "Unassigned"}</p>
          </div>
        </div>
        <div className="assign-select">
          <input
            type="text"
            placeholder="Search user by name or email"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <div className="user-list">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`user-row ${selectedUserId === String(u.id) ? "selected" : ""}`}
                onClick={() => setSelectedUserId(String(u.id))}
              >
                <div className="avatar">{(u.name || "U").charAt(0)}</div>
                <div className="user-meta">
                  <div className="user-name">{u.name}</div>
                  <div className="user-email">{u.email}</div>
                </div>
                <div className="user-role">{u.role}</div>
              </div>
            ))}
            {dataMembers.length === 0 && <p className="center-text">No eligible assignees</p>}
          </div>
        </div>
        <div className="assign-actions">
          <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
          <button
            className="btn-primary"
            onClick={assignTicket}
            disabled={!selectedUserId || assigning}
          >
            {assigning ? "Assigning…" : "Confirm Assignment"}
          </button>
        </div>
        {assignSuccess && <div className="success">{assignSuccess}</div>}
      </Modal>
    </DashboardLayout>
  );
};

export default OpenTickets;

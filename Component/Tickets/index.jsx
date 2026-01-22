import React, { useState, useMemo, useEffect } from 'react';
import './index.css';

const API_URL = 'http://localhost:8080/api/tickets';

const TicketListSimple = ({ onSelectTicket }) => {
  const [tickets, setTickets] = useState([]); // ✅ IMPORTANT
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔹 Fetch tickets from Spring Boot
  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tickets');
        return res.json();
      })
      .then(data => {
        setTickets(data || []); // safety
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to load tickets');
        setLoading(false);
      });
  }, []);

  // 🔹 Filtering logic
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        String(t.id).includes(search);

      const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
      const matchesType = filterType === 'ALL' || t.requestType === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [tickets, search, filterStatus, filterType]);

  if (loading) return <p className="loading">Loading tickets...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="ticket-list-container">
      <h2>Tickets</h2>

      {/* Filters */}
      <div className="ticket-filters">
        <input
          type="text"
          placeholder="Search by ID or Title"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="RESOLVED">RESOLVED</option>
        </select>

        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="ACCESS">ACCESS</option>
          <option value="BUG">BUG</option>
          <option value="FEATURE">FEATURE</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>

      {/* Ticket Table */}
      <table className="ticket-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Requester</th>
            <th>Assigned To</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.length > 0 ? (
            filteredTickets.map(ticket => (
              <tr key={ticket.id} onClick={() => onSelectTicket(ticket.id)}>
                <td>{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>{ticket.requestType}</td>
                <td>{ticket.status}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.requesterName}</td>
                <td>{ticket.assignedToName || 'Unassigned'}</td>
                <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="no-tickets">No tickets found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketListSimple;

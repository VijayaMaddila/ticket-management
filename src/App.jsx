import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../Login";
import Dashboard from "../Component/DashBoard";
import CreateTicket from "../Component/CreateTicket";
import TicketDetails from "../Component/TicketDetails";
import AdminPanel from "../Component/Admin";
import AssignedTickets from "../Component/DataMember";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* DASHBOARD */}
        <Route path="/" element={<Dashboard user={user} />} />

        {/* CREATE TICKET - REQUESTER ONLY */}
        <Route
          path="/create-ticket"
          element={
            user.role.toLowerCase() === "requester" ? (
              <CreateTicket user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ASSIGNED TICKETS - DATAMEMBER ONLY */}
        <Route
          path="/assigned-tickets"
          element={
            user.role.toLowerCase() === "datamember" ? (
              <AssignedTickets user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* TICKET DETAILS - Only Admins & Requesters */}
        <Route
          path="/ticket/:id"
          element={
            user.role.toLowerCase() === "admin" ||
            user.role.toLowerCase() === "requester" ? (
              <TicketDetails user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* ADMIN PANEL - ADMIN ONLY */}
        <Route
          path="/admin"
          element={
            user.role.toLowerCase() === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

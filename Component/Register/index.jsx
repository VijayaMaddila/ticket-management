import { useState } from "react";
import "./index.css"

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const userDetails = { name, email, password, role };
    const url = "http://localhost:8080/api/users";

    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails),
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        setSuccess("Registration successful!");
        setName("");
        setEmail("");
        setPassword("");
        setRole("USER");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label htmlFor="role">Role:</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="REQUESTER">Requester</option>
          <option value="DATAMEMBER">Satamember</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;

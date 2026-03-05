import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth.api";

export default function LoginPage() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("Password123");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const result = await login(email, password);
      localStorage.setItem("token", result.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome, please login</h1>
      <form onSubmit={handleLogin}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <br /><br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <br /><br />
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 12 }}>
        Need an account? <Link to="/register">Register</Link>
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

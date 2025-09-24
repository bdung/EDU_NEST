import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const accounts = [
  { username: "admin", password: "123", role: "admin" },
  { username: "user", password: "123", role: "user" },
];

function LoginView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const account = accounts.find(a => a.username === username && a.password === password);
    if (!account) {
      setError("Sai username hoặc password!");
      return;
    }

    // Lưu role và username vào localStorage
    localStorage.setItem("role", account.role);
    localStorage.setItem("username", account.username);

    // Redirect theo role
    if (account.role === "admin") navigate("/editor");
    else navigate("/exam");
  };

  return (
    <div style={{ padding: "50px", maxWidth: "400px", margin: "auto" }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: "8px" }}>Login</button>
      </form>
    </div>
  );
}

export default LoginView;

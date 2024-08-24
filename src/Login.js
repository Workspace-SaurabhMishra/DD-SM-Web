import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token and validate it
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp > currentTime) {
          navigate("/editor"); // Token is valid, reroute to editor
        }
      } catch (err) {
        console.log("Invalid token", err);
        // Invalid token, remove it from storage
        localStorage.removeItem("access_token");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8978/admin/login", {
        adminId,
        password,
      });

      if (response.status === 200) {
        const { access_token } = response.data.data;
        localStorage.setItem("access_token", access_token);
        navigate("/editor"); // Redirect to editor page
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid Credentials");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "100px auto",
        padding: "20px",
        border: "1px solid #444",
        borderRadius: "10px",
        backgroundColor: "#1e1e1e",
        color: "#e0e0e0",
      }}
    >
      <h2 style={{ color: "#00bcd4" }}>Login</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "10px" }}>
          <label>Admin ID</label>
          <input
            type="text"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              margin: "5px 0",
              backgroundColor: "#121212",
              color: "#ffffff",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              margin: "5px 0",
              backgroundColor: "#121212",
              color: "#ffffff",
              border: "1px solid #444",
              borderRadius: "4px",
            }}
            required
          />
        </div>
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#00bcd4",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    // ✅ Predefined admin credentials
    const adminName = "admin";
    const adminPassword = "admin123";

    if (form.name === adminName && form.password === adminPassword) {
      alert("Admin logged in successfully!");
      console.log("Admin login successful");
      // Redirect or dashboard later
      navigate("/admin-dashboard");
    } else {
      alert("Invalid admin credentials");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Admin Login</h1>
      <input
        name="name"
        placeholder="Admin Name"
        value={form.name}
        onChange={handleChange}
        style={styles.input}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        style={styles.input}
      />
      <button onClick={handleLogin} style={styles.button}>
        Login
      </button>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    backgroundColor: "#f4f6f8",
  },
  input: {
    padding: "10px",
    width: "260px",
    fontSize: "16px",
    marginBottom: "10px",
  },
  button: {
    padding: "12px 25px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};

export default AdminLogin;

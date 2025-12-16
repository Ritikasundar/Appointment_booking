import { useState } from "react";
import { databases, DATABASE_ID, USER_COLLECTION_ID } from "../appwrite/config";
import { Query, ID } from "appwrite";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
  // ✅ Initialize form with empty strings
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "" // role empty for now
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGetStarted = async () => {
    try {
      const userData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role
      };

      // Check if user exists by email
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_COLLECTION_ID,
        [Query.equal("email", userData.email)]
      );

      if (response.total > 0) {
        // USER EXISTS → LOGIN
        alert(`Welcome back, ${response.documents[0].name}`);
        console.log("Existing user:", response.documents[0]);
      } else {
        // CREATE USER
        const newUser = await databases.createDocument(
          DATABASE_ID,
          USER_COLLECTION_ID,
          ID.unique(),
          userData
        );

        alert(`User created & logged in. Welcome, ${newUser.name}`);
        console.log("New user:", newUser);
      }
      navigate("/patient-dashboard", {
        state: { email: userData.email }
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please check console.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Hospital Appointment System</h1>
      <p>Enter your details to get started</p>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        style={styles.input}
      />

      {/* Get Started Button */}
      <button onClick={handleGetStarted} style={styles.getStartedButton}>
        Get Started
      </button>

      {/* Dummy Doctor/Admin Buttons */}
      <div style={styles.buttonGroup}>
        <button
    style={styles.button}
    onClick={() => navigate("/doctor-login")}
  >Doctor</button>
        <button style={styles.button}
         onClick={() => navigate("/admin-login")}
         >Admin</button>
      </div>
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
  },
  getStartedButton: {
    padding: "12px 25px",
    fontSize: "16px",
    marginTop: "10px",
    cursor: "pointer",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  buttonGroup: {
    display: "flex",
    gap: "15px",
    marginTop: "15px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Home;

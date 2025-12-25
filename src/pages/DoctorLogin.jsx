import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases, DATABASE_ID } from "../appwrite/config";
import { Query } from "appwrite";

const DOCTOR_COLLECTION_ID = "doctors";

function DoctorLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      if (!form.name || !form.email) return alert("Please fill in both fields");

      const response = await databases.listDocuments(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        [Query.equal("email", form.email)]
      );

      if (response.total > 0) {
        const doctor = response.documents[0];
        if (doctor.name === form.name) {
          alert(`Doctor logged in: ${doctor.name}`);
          navigate("/doctor-dashboard", { state: { doctor } });
        } else {
          alert("Name does not match the registered doctor");
        }
      } else alert("Doctor not found");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Doctor Login</h1>
      <input name="name" placeholder="Doctor Name" value={form.name} onChange={handleChange} style={styles.input} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} style={styles.input} />
      <button onClick={handleLogin} style={styles.button}>Login</button>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", backgroundColor: "#f4f6f8" },
  input: { padding: "10px", width: "260px", fontSize: "16px", marginBottom: "10px" },
  button: { padding: "12px 25px", fontSize: "16px", cursor: "pointer", backgroundColor: "#2ecc71", color: "white", border: "none", borderRadius: "5px" },
};

export default DoctorLogin;

import { useState } from "react";
import { databases, DATABASE_ID, DOCTOR_COLLECTION_ID } from "../appwrite/config";
import { ID, Query } from "appwrite";

function AdminDashboard() {
  const [showForm, setShowForm] = useState(false);

  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
  });

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleAddDoctor = async () => {
    try {
      if (
        !doctor.name ||
        !doctor.email ||
        !doctor.phone ||
        !doctor.specialization
      ) {
        alert("Please fill all fields");
        return;
      }

      // Check if doctor already exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        [Query.equal("email", doctor.email)]
      );

      if (existing.total > 0) {
        alert("Doctor already exists");
        return;
      }

      // Create doctor
      await databases.createDocument(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        ID.unique(),
        {
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization,
        }
      );

      alert("Doctor added successfully");

      setDoctor({
        name: "",
        email: "",
        phone: "",
        specialization: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Error adding doctor");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>

      <button
        style={styles.addButton}
        onClick={() => setShowForm(!showForm)}
      >
        Add Doctor
      </button>

      {showForm && (
        <div style={styles.form}>
          <input
            name="name"
            placeholder="Doctor Name"
            value={doctor.name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            placeholder="Email"
            value={doctor.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={doctor.phone}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="specialization"
            placeholder="Specialization"
            value={doctor.specialization}
            onChange={handleChange}
            style={styles.input}
          />

          <button onClick={handleAddDoctor} style={styles.saveButton}>
            Save Doctor
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    paddingTop: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },
  addButton: {
    padding: "12px 25px",
    fontSize: "16px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "300px",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
  },
  saveButton: {
    padding: "10px",
    fontSize: "16px",
    backgroundColor: "#2ecc71",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default AdminDashboard;

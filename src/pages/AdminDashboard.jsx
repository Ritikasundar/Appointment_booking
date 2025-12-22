import { useEffect, useState } from "react";
import {
  databases,
  DATABASE_ID,
  DOCTOR_COLLECTION_ID,
} from "../appwrite/config";
import { ID, Query } from "appwrite";

const APPOINTMENT_COLLECTION_ID = "appointments";

function AdminDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
  });

  // ---------------- DOCTOR HANDLING ----------------
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

      const existing = await databases.listDocuments(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        [Query.equal("email", doctor.email)]
      );

      if (existing.total > 0) {
        alert("Doctor already exists");
        return;
      }

      await databases.createDocument(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        ID.unique(),
        doctor
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

  // ---------------- APPOINTMENTS ----------------
  const fetchAppointments = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID
      );
      setAppointments(res.documents);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (appointmentId, newStatus) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID,
        appointmentId,
        { status: newStatus }
      );

      fetchAppointments(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>

      {/* ADD DOCTOR */}
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

      {/* APPOINTMENTS TABLE */}
      <h2 style={{ marginTop: "40px" }}>All Appointments</h2>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Audio</th>
            <th>Video</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.$id}>
              <td>{appt.patientEmail}</td>
              <td>{appt.doctorName}</td>
              <td>{appt.date}</td>
              <td>{appt.time}</td>
              <td>{appt.needAudioCall ? "Yes" : "No"}</td>
              <td>{appt.needVideoCall ? "Yes" : "No"}</td>
              <td>{appt.reason}</td>

              <td>
                <select
                  value={appt.status}
                  onChange={(e) =>
                    updateStatus(appt.$id, e.target.value)
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
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
  },
  form: {
    marginTop: "20px",
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
  table: {
    width: "100%",
    marginTop: "20px",
    borderCollapse: "collapse",
    background: "white",
  },
};

export default AdminDashboard;

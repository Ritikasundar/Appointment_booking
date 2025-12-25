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

  // ================= DOCTOR =================
  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleAddDoctor = async () => {
    try {
      if (!doctor.name || !doctor.email || !doctor.phone || !doctor.specialization) {
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
      setDoctor({ name: "", email: "", phone: "", specialization: "" });
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert("Error adding doctor");
    }
  };

  // ================= APPOINTMENTS =================
  const fetchAppointments = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID
      );
      setAppointments(res.documents);
    } catch (err) {
      console.error("Fetch error", err);
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
      fetchAppointments();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // ================= SEND MAIL =================
  const sendMail = async (appt) => {
    try {
      // Fetch doctor email from Doctor collection
      const doctorDoc = await databases.listDocuments(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        [Query.equal("name", appt.doctorName)]
      );

      const doctorEmail =
        doctorDoc.total > 0 ? doctorDoc.documents[0].email : null;

      const response = await fetch("http://localhost:5000/send-appointment-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientEmail: appt.patientEmail,
          doctorEmail: doctorEmail,
          doctorName: appt.doctorName,
          date: appt.date,
          time: appt.time,
          status: appt.status,
          reason: appt.reason,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Mail sent to patient and doctor successfully");
      } else {
        alert("Mail sending failed");
      }
    } catch (err) {
      console.error(err);
      alert("Backend not reachable");
    }
  };

  // ================= CREATE CALL TOKEN & SEND =================
  const createTokenAndSendMail = async (appt) => {
    try {
      // Fetch doctor email
      const doctorDoc = await databases.listDocuments(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        [Query.equal("name", appt.doctorName)]
      );

      const doctorEmail =
        doctorDoc.total > 0 ? doctorDoc.documents[0].email : null;

      const res = await fetch(
        "http://localhost:5000/create-call-and-send-mail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientEmail: appt.patientEmail,
            doctorEmail: doctorEmail,
            doctorName: appt.doctorName,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Call link sent to patient and doctor email");
      } else {
        alert("Failed to create call");
      }
    } catch (err) {
      console.error(err);
      alert("Backend error");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>

      <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
        Add Doctor
      </button>

      {showForm && (
        <div style={styles.form}>
          <input name="name" placeholder="Doctor Name" value={doctor.name} onChange={handleChange} />
          <input name="email" placeholder="Email" value={doctor.email} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={doctor.phone} onChange={handleChange} />
          <input name="specialization" placeholder="Specialization" value={doctor.specialization} onChange={handleChange} />
          <button onClick={handleAddDoctor} style={styles.saveButton}>Save Doctor</button>
        </div>
      )}

      <h2 style={{ marginTop: "40px" }}>All Appointments</h2>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Mail</th>
            <th>Audio Call</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.$id}>
              <td>{appt.patientEmail}</td>
              <td>{appt.doctorName}</td>
              <td>{appt.date}</td>
              <td>{appt.time}</td>
              <td>{appt.reason}</td>

              <td>
                <select
                  value={appt.status}
                  onChange={(e) => updateStatus(appt.$id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </td>

              <td>
                <button
                  style={styles.mailButton}
                  onClick={() => sendMail(appt)}
                >
                  Send
                </button>
              </td>

              <td>
                {appt.needAudioCall ? (
                  <button
                    style={styles.audioButton}
                    onClick={() => createTokenAndSendMail(appt)}
                  >
                    Create Token
                  </button>
                ) : (
                  "No"
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { padding: "30px", background: "#f4f6f8" },
  addButton: { padding: "10px 20px", background: "#3498db", color: "#fff" },
  saveButton: { padding: "10px", background: "#2ecc71", color: "#fff" },
  mailButton: { padding: "6px 14px", background: "#9b59b6", color: "#fff", border: "none" },
  audioButton: { padding: "6px 12px", background: "#e67e22", color: "#fff", border: "none", cursor: "pointer" },
  form: { marginTop: "20px", background: "#fff", padding: "20px" },
  table: { width: "100%", marginTop: "20px", background: "#fff" },
};

export default AdminDashboard;

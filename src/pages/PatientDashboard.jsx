import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { databases, DATABASE_ID, APPOINTMENT_COLLECTION_ID } from "../appwrite/config";
import { ID, Query } from "appwrite";

function PatientDashboard() {
    const navigate = useNavigate();
  const location = useLocation();
  const patientEmail = location.state?.email;

  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    doctorName: "",
    doctorEmail: "",
    date: ""
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const response = await databases.listDocuments(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      [Query.equal("patientEmail", patientEmail)]
    );
    setAppointments(response.documents);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const bookAppointment = async () => {
    if (!form.doctorName || !form.doctorEmail || !form.date) {
      alert("Fill all fields");
      return;
    }

    await databases.createDocument(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      ID.unique(),
      {
        patientEmail,
        doctorName: form.doctorName,
        doctorEmail: form.doctorEmail,
        date: form.date,
        status: "Pending"
      }
    );

    alert("Appointment booked");

    setForm({ doctorName: "", doctorEmail: "", date: "" });
    setShowForm(false);
    fetchAppointments();
  };

  return (
    <div style={styles.container}>
      <h1>Patient Dashboard</h1>
      <p>Logged in as: {patientEmail}</p>

      <button
        style={styles.button}
        onClick={() =>
          navigate("/book-appointment", {
            state: { email: patientEmail },
          })
        }
      >
        Book Appointment
      </button>

      

      <h2>Your Appointments</h2>

      {appointments.length === 0 && <p>No appointments yet</p>}

      {appointments.map((a) => (
        <div key={a.$id} style={styles.card}>
          <p><b>Doctor:</b> {a.doctorName}</p>
          <p><b>Date:</b> {a.date}</p>
          <p><b>Status:</b> {a.status}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "20px",
    backgroundColor: "#f4f6f8",
  },
  bookBtn: {
    padding: "10px 20px",
    marginBottom: "15px",
    cursor: "pointer",
  },
  form: {
    background: "white",
    padding: "15px",
    marginBottom: "20px",
    width: "300px",
  },
  card: {
    background: "white",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
  },
};

export default PatientDashboard;

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { databases, DATABASE_ID } from "../appwrite/config";
import { ID } from "appwrite";

const APPOINTMENT_COLLECTION_ID = "appointments";
const DOCTOR_COLLECTION_ID = "doctors";

function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();
  const patientEmail = location.state?.email;

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorName: "",
    date: "",
    time: "",
    reason: "",
  });

  // 🔹 Fetch doctors on page load
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          DOCTOR_COLLECTION_ID
        );
        setDoctors(res.documents);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };

    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.doctorName || !form.date || !form.time || !form.reason) {
      alert("Please fill all fields");
      return;
    }

    try {
      await databases.createDocument(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID,
        ID.unique(),
        {
          patientEmail,
          doctorName: form.doctorName,
          date: form.date,
          time: form.time,
          reason: form.reason,
          status: "Pending",
        }
      );

      alert("Appointment booked successfully");

      navigate("/patient-dashboard", {
        state: { email: patientEmail },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to book appointment");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Book Appointment</h2>

      {/* 🔽 Doctor Dropdown */}
      <select
        name="doctorName"
        value={form.doctorName}
        onChange={handleChange}
        style={styles.input}
      >
        <option value="">Select Doctor</option>
        {doctors.map((doc) => (
          <option key={doc.$id} value={doc.name}>
            {doc.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        style={styles.input}
      />

      <input
        type="time"
        name="time"
        value={form.time}
        onChange={handleChange}
        style={styles.input}
      />

      <textarea
        name="reason"
        placeholder="Reason for visit"
        value={form.reason}
        onChange={handleChange}
        style={styles.input}
      />

      <button onClick={handleSubmit} style={styles.button}>
        Submit Appointment
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
  },
  input: {
    display: "block",
    marginBottom: "12px",
    padding: "10px",
    width: "300px",
  },
  button: {
    padding: "10px 20px",
  },
};

export default BookAppointment;

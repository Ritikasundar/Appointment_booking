import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { databases, DATABASE_ID } from "../appwrite/config";
import { ID, Query } from "appwrite";

const APPOINTMENT_COLLECTION_ID = "appointments";
const DOCTOR_COLLECTION_ID = "doctors";

function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();

  const patientEmail = location.state?.email; // only patient email
  // Removed patientName

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    doctorName: "",
    date: "",
    time: "",
    reason: "",
    needAudioCall: false,
    needVideoCall: false,
  });

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await databases.listDocuments(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID
      );
      setDoctors(res.documents);
    };
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleToggle = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!form.doctorName || !form.date || !form.time || !form.reason) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Fetch doctor document to get email
      const doctorRes = await databases.listDocuments(
        DATABASE_ID,
        DOCTOR_COLLECTION_ID,
        [Query.equal("name", form.doctorName)]
      );

      if (doctorRes.total === 0) {
        alert("Selected doctor not found");
        return;
      }

      const doctorEmail = doctorRes.documents[0].email;

      await databases.createDocument(
        DATABASE_ID,
        APPOINTMENT_COLLECTION_ID,
        ID.unique(),
        {
          patientEmail,       // only patient email
          doctorName: form.doctorName,
          doctorEmail,        // store doctor's email
          date: form.date,
          time: form.time,
          reason: form.reason,
          needAudioCall: form.needAudioCall,
          needVideoCall: form.needVideoCall,
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

      {/* 🔘 Audio Call Toggle */}
      <div style={styles.toggleGroup}>
        <p>Need Audio Call?</p>
        <button
          style={form.needAudioCall ? styles.activeToggle : styles.toggle}
          onClick={() => handleToggle("needAudioCall", true)}
        >
          Yes
        </button>
        <button
          style={!form.needAudioCall ? styles.activeToggle : styles.toggle}
          onClick={() => handleToggle("needAudioCall", false)}
        >
          No
        </button>
      </div>

      {/* 🔘 Video Call Toggle */}
      <div style={styles.toggleGroup}>
        <p>Need Video Call?</p>
        <button
          style={form.needVideoCall ? styles.activeToggle : styles.toggle}
          onClick={() => handleToggle("needVideoCall", true)}
        >
          Yes
        </button>
        <button
          style={!form.needVideoCall ? styles.activeToggle : styles.toggle}
          onClick={() => handleToggle("needVideoCall", false)}
        >
          No
        </button>
      </div>

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
  toggleGroup: {
    marginBottom: "15px",
  },
  toggle: {
    padding: "8px 15px",
    marginRight: "10px",
    cursor: "pointer",
  },
  activeToggle: {
    padding: "8px 15px",
    marginRight: "10px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  button: {
    padding: "10px 20px",
    marginTop: "15px",
  },
};

export default BookAppointment;

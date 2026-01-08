import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  databases,
  DATABASE_ID,
  APPOINTMENT_COLLECTION_ID,
  PATIENT_COLLECTION_ID,
  storage,
  BUCKET_ID,
} from "../appwrite/config";
import { Query, ID } from "appwrite";

function PatientDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const patientEmail = location.state?.email;

  const [appointments, setAppointments] = useState([]);
  const [checkingPatient, setCheckingPatient] = useState(true);
  const [explanation, setExplanation] = useState("");
const [loadingExplain, setLoadingExplain] = useState(false);


  const [form, setForm] = useState({
    doctorName: "",
    doctorEmail: "",
    date: "",
  });

  useEffect(() => {
    if (!patientEmail) {
      navigate("/login");
      return;
    }
    checkPatientExists();
  }, [patientEmail]);

  const checkPatientExists = async () => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        PATIENT_COLLECTION_ID,
        [Query.equal("email", patientEmail)]
      );

      if (res.documents.length === 0) {
        navigate("/patient-registration", {
          state: { email: patientEmail },
        });
      } else {
        await fetchAppointments();
        setCheckingPatient(false);
      }
    } catch (error) {
      console.error("Error checking patient:", error);
    }
  };

  const fetchAppointments = async () => {
    const response = await databases.listDocuments(
      DATABASE_ID,
      APPOINTMENT_COLLECTION_ID,
      [Query.equal("patientEmail", patientEmail)]
    );
    setAppointments(response.documents);
  };

  // ================= SEND REPORT TO MAIL =================
const sendReportToMail = async (fileId) => {
  if (!fileId) {
    alert("Report not available");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/send-report-mail",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientEmail,
          reportFileId: fileId,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      alert("Report sent to your email");
    } else {
      alert("Failed to send report");
    }
  } catch (error) {
    console.error(error);
    alert("Server not reachable");
  }
};
// ================= EXPLAIN REPORT =================
const explainReport = async (fileId) => {
  if (!fileId) {
    alert("Report not available");
    return;
  }

  try {
    setLoadingExplain(true);
    setExplanation("");

    const response = await fetch(
      "http://localhost:5000/explain-report",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportFileId: fileId }),
      }
    );

    const data = await response.json();

    if (data.success) {
      setExplanation(data.explanation);
    } else {
      alert("Failed to explain report");
    }
  } catch (error) {
    console.error(error);
    alert("Server error");
  } finally {
    setLoadingExplain(false);
  }
};

  // ================= VIEW REPORT =================
  const viewReport = (fileId) => {
    if (!fileId) {
      alert("Report not available yet");
      return;
    }

    const fileUrl = storage.getFileView(BUCKET_ID, fileId);
    window.open(fileUrl, "_blank");
  };

  if (checkingPatient) {
    return <p style={{ padding: 20 }}>Checking patient profile...</p>;
  }

  return (
    <div style={styles.container}>
      <h1>Patient Dashboard</h1>
      <p>Logged in as: {patientEmail}</p>

      <button
        style={styles.bookBtn}
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

          <button
            style={styles.viewBtn}
            onClick={() => viewReport(a.reportFileId)}
            disabled={!a.reportFileId}
          >
            View Report
          </button>
          <button
  style={styles.mailBtn}
  onClick={() => sendReportToMail(a.reportFileId)}
  disabled={!a.reportFileId}
>
  Send to Mail
</button>
<button
  style={styles.explainBtn}
  onClick={() => explainReport(a.reportFileId)}
  disabled={!a.reportFileId || loadingExplain}
>
  Explain Report
</button>

        </div>
      ))}
      {explanation && (
  <div style={styles.explainBox}>
    <h3>Report Explanation</h3>
    <p>{explanation}</p>
  </div>
)}

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
  card: {
    background: "white",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
  },
  viewBtn: {
    marginTop: "10px",
    padding: "6px 12px",
    backgroundColor: "#1976d2",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  
  },
  mailBtn: {
  marginTop: "8px",
  marginLeft: "10px",
  padding: "6px 12px",
  backgroundColor: "#2ecc71",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
},
explainBtn: {
  marginTop: "8px",
  marginLeft: "10px",
  padding: "6px 12px",
  backgroundColor: "#f39c12",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
},

explainBox: {
  marginTop: "20px",
  padding: "15px",
  background: "#fff8e1",
  borderRadius: "6px",
  lineHeight: "1.6",
},

};

export default PatientDashboard;

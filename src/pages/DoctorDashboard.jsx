import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { databases, DATABASE_ID } from "../appwrite/config";

const APPOINTMENT_COLLECTION_ID = "appointments";

function DoctorDashboard() {
  const location = useLocation();
  const doctor = location.state?.doctor; // doctor info from login
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, APPOINTMENT_COLLECTION_ID);
      // filter appointments for this doctor
      const doctorAppointments = res.documents.filter(appt => appt.doctorEmail === doctor.email);
      setAppointments(doctorAppointments);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch appointments");
    }
  };

  useEffect(() => { if (doctor) fetchAppointments(); }, [doctor]);

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Doctor Dashboard</h1>
      <h2 style={{ marginTop: "20px" }}>Appointments for Dr. {doctor?.name}</h2>

      <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#2563eb", color: "#fff" }}>
            <th style={thTd}>Patient Email</th>
            <th style={thTd}>Date</th>
            <th style={thTd}>Time</th>
            <th style={thTd}>Reason</th>
            <th style={thTd}>Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appt => (
            <tr key={appt.$id} style={{ textAlign: "center", borderBottom: "1px solid #ccc" }}>
              <td style={thTd}>{appt.patientEmail}</td>
              <td style={thTd}>{appt.date}</td>
              <td style={thTd}>{appt.time}</td>
              <td style={thTd}>{appt.reason}</td>
              <td style={thTd}>{appt.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thTd = { padding: "10px", border: "1px solid #ccc" };

export default DoctorDashboard;

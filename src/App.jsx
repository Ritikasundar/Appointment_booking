import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import DoctorLogin from "./pages/DoctorLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PatientRegistration from "./pages/PatientRegistration";
import BookAppointment from "./pages/BookAppointment";
import JoinCall from "./pages/JoinCall";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/doctor-login" element={<DoctorLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/patient-dashboard" element={<PatientDashboard />} />
      <Route path="/book-appointment" element={<BookAppointment />} />
      <Route path="/join-call" element={<JoinCall />} />

       <Route
        path="/patient-registration"
        element={<PatientRegistration />}
      />

    </Routes>
  );
}

export default App;

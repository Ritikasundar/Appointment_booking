import { useState } from "react";
import { databases, DATABASE_ID, PATIENT_COLLECTION_ID } from "../appwrite/config";
import { ID } from "appwrite";
import { useNavigate, useLocation } from "react-router-dom";

function PatientRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    birthDate: "",
    gender: "",
    address: "",
    occupation: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    primaryPhysician: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    allergies: "",
    currentMedication: "",
    familyMedicalHistory: "",
    pastMedicalHistory: "",
    identificationType: "",
    identificationNumber: "",
    privacyConsent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const registerPatient = async () => {
    if (!form.name || !form.phone || !form.privacyConsent) {
      alert("Please fill required fields");
      return;
    }

    await databases.createDocument(
      DATABASE_ID,
      PATIENT_COLLECTION_ID,
      ID.unique(),
      {
        userId: ID.unique(),
        email,
        ...form,
      }
    );

    alert("Registration successful");
    navigate("/patient-dashboard", { state: { email } });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Patient Registration</h2>
      <input name="name" placeholder="Full Name" onChange={handleChange} />
      <input name="phone" placeholder="Phone" onChange={handleChange} />
      <input type="date" name="birthDate" onChange={handleChange} />
      <input name="gender" placeholder="Gender" onChange={handleChange} />
      <input name="address" placeholder="Address" onChange={handleChange} />
      <input name="occupation" placeholder="Occupation" onChange={handleChange} />

      <h4>Emergency Contact</h4>
      <input name="emergencyContactName" placeholder="Name" onChange={handleChange} />
      <input name="emergencyContactNumber" placeholder="Phone" onChange={handleChange} />

      <h4>Medical Info</h4>
      <input name="primaryPhysician" placeholder="Physician" onChange={handleChange} />
      <input name="allergies" placeholder="Allergies" onChange={handleChange} />
      <input name="currentMedication" placeholder="Medication" onChange={handleChange} />

      <h4>Identification</h4>
      <input name="identificationType" placeholder="ID Type" onChange={handleChange} />
      <input name="identificationNumber" placeholder="ID Number" onChange={handleChange} />

      <label>
        <input type="checkbox" name="privacyConsent" onChange={handleChange} />
        I agree to privacy policy
      </label>

      <br /><br />
      <button onClick={registerPatient}>Register</button>
    </div>
  );
}

export default PatientRegistration;

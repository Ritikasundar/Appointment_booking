const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const app = express();
app.use(cors());
app.use(express.json());

// ================== AGORA CONFIG ==================
const APP_ID = "36a8711c6a374888bf3de28263b4b482";
const APP_CERTIFICATE = "ac4a4eae979d47f9a423710e01bd5b59";

// ================== MAIL CONFIG ==================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ritikas2314@gmail.com",
    pass: "tsej uxoo youf wkcr",
  },
});

// ================== APPOINTMENT MAIL ==================
app.post("/send-appointment-mail", async (req, res) => {
  const { patientEmail, doctorEmail, doctorName, date, time, status, reason } = req.body;

  try {
    const subject = `Appointment ${status}`;
    const message = `
Hello,

Appointment Details:

Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Reason: ${reason}
Status: ${status}

Regards,
Hospital Team
`;

    // Send to patient
    await transporter.sendMail({
      from: "ritikas2314@gmail.com",
      to: patientEmail,
      subject,
      text: message,
    });

    // Send to doctor
    if (doctorEmail) {
      await transporter.sendMail({
        from: "ritikas2314@gmail.com",
        to: doctorEmail,
        subject: `Patient Appointment: ${status}`,
        text: `Hello ${doctorName},\n\nYou have an appointment scheduled with ${patientEmail} on ${date} at ${time}.\nReason: ${reason}\nStatus: ${status}\n\nRegards,\nHospital Team`,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// ================== CREATE CALL TOKEN + SEND MAIL ==================
app.post("/create-call-and-send-mail", async (req, res) => {
  const { patientEmail, doctorEmail, doctorName } = req.body;

  try {
    const channelName = `channel-${Math.random().toString(36).substring(2, 10)}`;
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    const callLink = `http://localhost:5173/join-call?channel=${encodeURIComponent(
      channelName
    )}&token=${encodeURIComponent(token)}`;

    const message = `
Hello,

Your audio consultation has been scheduled.

Doctor: ${doctorName}

Click the link below to join the call:
${callLink}

This link is valid for 1 hour.

Regards,
Hospital Team
`;

    // Send to patient
    await transporter.sendMail({
      from: "ritikas2314@gmail.com",
      to: patientEmail,
      subject: "Audio Consultation Link",
      text: message,
    });

    // Send to doctor
    if (doctorEmail) {
      await transporter.sendMail({
        from: "ritikas2314@gmail.com",
        to: doctorEmail,
        subject: `Patient Audio Call: ${patientEmail}`,
        text: `Hello ${doctorName},\n\nYour patient (${patientEmail}) has an audio consultation scheduled.\nJoin link: ${callLink}\nThis link is valid for 1 hour.\n\nRegards,\nHospital Team`,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
});

// ================== SERVER ==================
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});

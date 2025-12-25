const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// ================== AGORA CONFIG ==================
const APP_ID = "36a8711c6a374888bf3de28263b4b482";
const APP_CERTIFICATE = "ac4a4eae979d47f9a423710e01bd5b59";
const FRONTEND_URL = "http://localhost:5173";
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

// ================== VIDEO CALL ==================
const WHEREBY_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmFwcGVhci5pbiIsImF1ZCI6Imh0dHBzOi8vYXBpLmFwcGVhci5pbi92MSIsImV4cCI6OTAwNzE5OTI1NDc0MDk5MSwiaWF0IjoxNzI1OTA1NTU3LCJvcmdhbml6YXRpb25JZCI6MjY3ODA3LCJqdGkiOiJmNGJiNmUxMy0xODExLTQ1NzQtOTAyYi0yMjgxYzQyZTVlODgifQ.241gW8pKsycQXmK3-akPSnUzw9MJeYdZh29yy6zY27g"; // Replace with your Whereby API key

app.post("/create-video-call-and-send-mail", async (req, res) => {
  const { patientEmail, doctorEmail, doctorName } = req.body;

  try {
    const expiryTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

    // Create video room using Whereby API
    const response = await axios.post(
      "https://api.whereby.dev/v1/meetings",
      { endDate: expiryTime, fields: ["hostRoomUrl"] },
      { headers: { Authorization: `Bearer ${WHEREBY_API_KEY}`, "Content-Type": "application/json" } }
    );

    const roomUrl = response.data.hostRoomUrl;
    const roomName = roomUrl.split("/").pop(); // Extract last part as room name

    // Send email to patient and doctor
    await transporter.sendMail({
      from: "ritikas2314@gmail.com",
      to: [patientEmail, doctorEmail],
      subject: "Video Consultation Link",
      text: `
Hello,

Your video consultation has been scheduled.

Doctor: ${doctorName}

Join the video call here:
${roomUrl}

This link is valid for 2 hours.

Regards,
Hospital Team
      `,
    });

    res.json({ success: true, roomUrl, roomName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================== SERVER ==================
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});

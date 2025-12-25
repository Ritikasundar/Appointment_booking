const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// ================== MAIL CONFIG ==================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ritikas2314@gmail.com", // sender email
    pass: "tsej uxoo youf wkcr",    // Gmail App Password
  },
});

// ================== SEND MAIL API ==================
app.post("/send-appointment-mail", async (req, res) => {
  const {
    patientEmail,
    doctorName,
    date,
    time,
    status,
    reason,
  } = req.body;

  try {
    const mailOptions = {
      from: "ritikas2314@gmail.com",
      to: patientEmail, // ✅ patient email
      subject: `Appointment ${status}`,
      text: `
Hello,

Your appointment update:

Doctor Name : ${doctorName}
Date        : ${date}
Time        : ${time}
Reason      : ${reason}

Appointment Status: ${status}

If you have any questions, please contact us.

Regards,
Hospital Appointment Team
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Mail Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

// ================== SERVER ==================
app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});

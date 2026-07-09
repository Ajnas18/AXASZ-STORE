const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Read .env.local manually for this test script
const envLocalPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    envVars[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
  }
});

const transporter = nodemailer.createTransport({
  host: envVars.SMTP_HOST,
  port: Number(envVars.SMTP_PORT) || 587,
  secure: Number(envVars.SMTP_PORT) === 465,
  auth: {
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
  },
});

const mailOptions = {
  from: `"AXASZ STORE" <${envVars.SMTP_USER}>`,
  to: "mhdajnascp@gmail.com",
  subject: 'Password Reset Request',
  html: 'This is a test email from the test script.',
};

transporter.sendMail(mailOptions)
  .then(info => {
    console.log("Email sent successfully!");
    console.log(info);
  })
  .catch(err => {
    console.error("Failed to send email:", err);
  });

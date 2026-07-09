const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'axaszstore@gmail.com',
    pass: 'nzmtdavdpfpxfxrq'
  }
});

transporter.sendMail({
  from: 'axaszstore@gmail.com',
  to: 'axaszstore@gmail.com',
  subject: 'Test',
  text: 'Test email'
}).then(info => {
  console.log('Sent:', info.messageId);
}).catch(err => {
  console.error('Error:', err);
});

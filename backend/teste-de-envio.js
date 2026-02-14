// test_sendmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
  });

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: 'Teste de envio - deliverybairro.com',
    text: 'Teste de envio via NodeMailer usando senha de app Gmail.\n\n' +
      'Em ' + new Date().toLocaleString() + ' às ' + new Date().toLocaleTimeString(),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso:', info.response);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

sendTestEmail();

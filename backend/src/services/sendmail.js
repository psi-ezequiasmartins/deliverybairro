/**
* src/services/sendmail.js
*/

const express = require("express");
const authMiddleware = require('../auth');
const nodemailer = require('nodemailer');

const router = express.Router();

router.use(authMiddleware);

// NodeMailer

router.post('/send-message', async (request, response) => {
  const { nome, email, telefone, to_name, plano, categoria, responsavel, endereco } = request.body;
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
    subject: `Pré Cadastro para Delivery: ${nome}`,
    text: `Cadastro: Pré-cadastro de interesse em usar a plataforma deliverybairro.com:\n
        Delivery: ${nome}\n
        E-mail: ${email}\n
        Telefone: ${telefone}\n
        Departamento: ${to_name}\n
        Plano: ${plano}\n
        Categoria: ${categoria}\n
        Responsável: ${responsavel}\n
        Endereço: ${endereco}\n
      \n`,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Dados para pré-cadastro enviados com sucesso!');
    response.sendStatus(200);
  } catch (error) {
    console.error('Erro ao enviar pré-cadastro:', error);
    response.sendStatus(500);
  }
});

module.exports = router;
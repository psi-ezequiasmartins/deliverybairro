const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/database');

const accounts = {
  user: { table: 'usuarios', idColumn: 'USER_ID', label: 'usuário' },
  courier: { table: 'couriers', idColumn: 'COURIER_ID', label: 'entregador' }
};

function getMailer() {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_FROM) {
    throw new Error('Configuração de e-mail incompleta (MAIL_USER, MAIL_PASS, MAIL_FROM)');
  }

  return nodemailer.createTransport({
    service: process.env.MAIL_SERVICE || 'gmail',
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
  });
}

async function requestPasswordReset(accountType, email) {
  const account = accounts[accountType];
  if (!account) throw new Error('Tipo de conta inválido');

  const [rows] = await db.query(
    `SELECT ${account.idColumn} AS accountId
     FROM ${account.table}
     WHERE EMAIL = ? AND CHV = '1'
     LIMIT 1`,
    [email]
  );

  if (rows.length === 0) return;

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  await db.query(
    `DELETE FROM auth_password_resets
     WHERE ACCOUNT_TYPE = ? AND ACCOUNT_ID = ?`,
    [accountType, rows[0].accountId]
  );
  await db.query(
    `INSERT INTO auth_password_resets (ACCOUNT_TYPE, ACCOUNT_ID, EMAIL, CODE_HASH, EXPIRES_AT)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
    [accountType, rows[0].accountId, email, codeHash]
  );

  const transporter = getMailer();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Código para redefinir sua senha - deliverybairro.com',
    text: `Seu código para redefinir a senha da conta de ${account.label} é ${code}. Ele expira em 15 minutos.`
  });
}

async function resetPassword(accountType, email, code, passwordHash) {
  const account = accounts[accountType];
  if (!account) throw new Error('Tipo de conta inválido');

  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const [result] = await db.query(
    `UPDATE ${account.table} AS account
     INNER JOIN auth_password_resets AS reset
       ON reset.ACCOUNT_ID = account.${account.idColumn}
       AND reset.ACCOUNT_TYPE = ?
     SET account.\`PASSWORD\` = ?, reset.USED_AT = NOW()
     WHERE account.EMAIL = ? AND account.CHV = '1'
       AND reset.CODE_HASH = ? AND reset.EXPIRES_AT > NOW()
       AND reset.USED_AT IS NULL`,
    [accountType, passwordHash, email, codeHash]
  );

  if (result.affectedRows === 0) return false;

  await db.query(
    `DELETE FROM auth_password_resets
     WHERE ACCOUNT_TYPE = ? AND EMAIL = ?`,
    [accountType, email]
  );
  return true;
}

module.exports = { requestPasswordReset, resetPassword };

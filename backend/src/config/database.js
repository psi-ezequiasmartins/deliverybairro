/**
 * src/config/database.js
*/

const mysql = require('mysql');
require('dotenv').config();

// Criar conexão com pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Função para promisificar as queries
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      return resolve([results]);
    });
  });
};

// Exporta o objeto com método query promisificado
module.exports = { query };

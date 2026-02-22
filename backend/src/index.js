/**
 * src/index.js
 */

const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const routes_admin = require('./routes_admin');
const routes_delivery = require('./routes_deliveryapp');
const routes_user = require('./routes_userapp');
const routes_courier = require('./routes_courierapp');

const sendmail = require('./services/sendmail');
const pagseguro = require('./services/pagseguro');
const pix = require('./services/pix');

const app = express();

const PORT = process.env.SERVER_PORT || 33570;

app.use(express.json());
app.use(cors());
app.use('/admin', routes_admin);  // Admin PRIMEIRO, antes do middleware global
app.use(routes);
app.use(routes_delivery);
app.use(routes_user);
app.use(routes_courier);
app.use(sendmail);
app.use(pagseguro);
app.use(pix);

module.exports = app;

/**
 * backend\src\auth.js
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');

async function validate(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.sendStatus(401);
  }
  const [, token] = authorization.split(' ');
  try {
    await promisify(jwt.verify)(token, '#23f3dDF209B6dDc156e79F5405402ACffA1b7686');
    return next();
  } catch (err) {
    return res.sendStatus(401);
  }
}

module.exports = validate;
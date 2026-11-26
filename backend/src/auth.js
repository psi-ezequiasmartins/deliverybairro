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
    const decoded = await promisify(jwt.verify)(token, '#23f3dDF209B6dDc156e79F5405402ACffA1b7686');
    const deliveryOnlyRoute = req.path.startsWith('/delivery-app/') ||
      req.path === '/api/listar/deliveries' ||
      req.path === '/api/add/delivery' ||
      req.path.startsWith('/api/update/delivery/') ||
      req.path.startsWith('/api/delete/delivery/');
    if (decoded.tokenType === 'delivery-registration' ||
        (deliveryOnlyRoute && decoded.type !== 'delivery')) {
      return res.sendStatus(401);
    }
    if (req.path.startsWith('/user-app/') && decoded.type !== 'user') {
      return res.sendStatus(401);
    }
    if (req.path.startsWith('/api/courier/') && decoded.type !== 'courier') {
      return res.sendStatus(401);
    }
    req.auth = decoded;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.sendStatus(401);
  }
}

module.exports = validate;
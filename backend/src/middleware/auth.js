'use strict';

const jwt = require('jsonwebtoken');

/**
 * auth middleware — verifies JWT and injects req.user = { id, role }
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided', code: 'UNAUTHENTICATED' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'UNAUTHENTICATED' });
  }
};

module.exports = auth;

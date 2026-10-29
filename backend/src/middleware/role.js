'use strict';


const role = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated', code: 'UNAUTHENTICATED' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        code: 'FORBIDDEN',
      });
    }

    next();
  };
};

module.exports = role;

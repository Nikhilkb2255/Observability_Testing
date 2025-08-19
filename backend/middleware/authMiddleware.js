const jwt = require('jsonwebtoken');
const JWT_SECRET = 'dev_secret_key';

function authMiddleware(allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });

      req.user = user;

      // Allow string or array for roles
      if (allowedRoles) {
        if (Array.isArray(allowedRoles)) {
          if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ error: 'Access denied' });
          }
        } else {
          if (user.role !== allowedRoles) {
            return res.status(403).json({ error: 'Access denied' });
          }
        }
      }

      next();
    });
  };
}

module.exports = authMiddleware;

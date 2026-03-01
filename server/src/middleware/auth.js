const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authenticateToken(req, res, next) {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré', code: 'TOKEN_EXPIRED' });
    }
    return res.status(403).json({ error: 'Token invalide' });
  }
}

function optionalAuth(req, res, next) {
  const token = req.cookies?.access_token;
  if (token) {
    try {
      req.user = jwt.verify(token, env.JWT_SECRET);
    } catch {
      // ignore invalid token
    }
  }
  next();
}

module.exports = { authenticateToken, optionalAuth };

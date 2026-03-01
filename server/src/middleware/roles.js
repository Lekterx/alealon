function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Accès non autorisé' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Droits insuffisants' });
    }
    next();
  };
}

module.exports = { requireRole };

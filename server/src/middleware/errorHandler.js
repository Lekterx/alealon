const { ZodError } = require('zod');
const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  logger.error(err.message, { stack: err.stack });

  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Données invalides',
      details: err.flatten().fieldErrors,
    });
  }

  // PostgreSQL unique constraint
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Cette ressource existe déjà',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Référence invalide',
    });
  }

  // Custom business error
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Default
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Erreur interne du serveur'
      : err.message,
  });
}

module.exports = errorHandler;

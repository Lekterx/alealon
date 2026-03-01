const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userModel = require('../models/userModel');

function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
  return { accessToken, refreshToken };
}

function setCookies(res, accessToken, refreshToken) {
  const isProduction = env.NODE_ENV === 'production';
  const cookieBase = {
    httpOnly: true,
    secure: isProduction || env.COOKIE_SECURE,
    sameSite: isProduction ? 'strict' : 'lax',
    domain: env.COOKIE_DOMAIN,
  };

  res.cookie('access_token', accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie('refresh_token', refreshToken, { ...cookieBase, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth' });
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setCookies(res, accessToken, refreshToken);

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ error: 'Refresh token manquant' });
    }

    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setCookies(res, accessToken, refreshToken);

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Refresh token invalide' });
    }
    next(err);
  }
}

function logout(req, res) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token', { path: '/api/auth' });
  res.json({ message: 'Déconnexion réussie' });
}

async function me(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, logout, me };

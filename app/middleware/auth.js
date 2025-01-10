
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/auth.config');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'Token no provisto' });
    }
  
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ message: 'Token inválido o expirado' });
    }
  };
  
  module.exports = { verifyToken };
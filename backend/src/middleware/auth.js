const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Auth Error' });

  try {
    const splitToken = token.split(' ')[1] || token;
    const decoded = jwt.verify(splitToken, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(500).send({ message: 'Invalid Token' });
  }
};

const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    // Explicitly allow 'admin' role OR the specific Tamil Admin account
    if (user && (user.role === 'admin' || user.email === 'admin@tamilmw.com')) {
      next();
    } else {
      res.status(403).json({ message: 'Admin role required for this inventory action' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error in admin check' });
  }
};

module.exports = { protect, admin };

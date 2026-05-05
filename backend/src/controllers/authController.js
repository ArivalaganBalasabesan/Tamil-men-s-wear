const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validateRegistration } = require('../validations/authValidation');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Validations
    const { isValid, errors } = validateRegistration(req.body);
    if (!isValid) return res.status(400).json({ msg: errors[0] });

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, password, phone });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name, email, role: user.role } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email, role: user.role, loyaltyPoints: user.loyaltyPoints } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, googleId });
      await user.save();
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { height, weight, age } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { bodyProfile: { height, weight, age } }, { new: true });
    res.json(user.bodyProfile);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

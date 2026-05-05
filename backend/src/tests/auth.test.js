const request = require('supertest');
const express = require('express');

process.env.JWT_SECRET = 'test_secret_123';

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: '123' }; next(); },
  admin: (req, res, next) => next()
}));

jest.mock('../models/User', () => {
  const mockUser = { 
    _id: '123', 
    name: 'T', 
    email: 't@t.com', 
    password: 'h', 
    role: 'user',
    save: jest.fn().mockImplementation(function() {
      if (!this.email) throw new Error('Validation Failed');
      return Promise.resolve(true);
    }) 
  };
  const Mock = jest.fn().mockImplementation((data) => {
    return { ...mockUser, ...data, save: mockUser.save };
  });
  Mock.findOne = jest.fn();
  Mock.findById = jest.fn().mockResolvedValue(mockUser);
  Mock.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);
  return Mock;
});

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('s'),
  hash: jest.fn().mockResolvedValue('h'),
  compare: jest.fn().mockResolvedValue(true)
}));

const authRoutes = require('../routes/auth');
const User = require('../models/User');
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Member 1: Auth & Profile (6 Tests)', () => {
  it('1. Register success', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/register').send({ name: 'T', email: 't@t.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
  });
  it('2. Register validation (missing email)', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'T' });
    expect(res.statusCode).toEqual(400); // Updated: My new validation returns 400
  });
  it('3. Register existing', async () => {
    User.findOne.mockResolvedValue({ email: 't@t.com' });
    const res = await request(app).post('/api/auth/register').send({ name: 'T', email: 't@t.com', password: 'password123' });
    expect(res.statusCode).toEqual(400);
  });
  it('4. Login success', async () => {
    User.findOne.mockResolvedValue({ _id: '123', email: 't@t.com', password: 'h' });
    const res = await request(app).post('/api/auth/login').send({ email: 't@t.com', password: 'password123' });
    expect(res.statusCode).toEqual(200);
  });
  it('5. Login fail', async () => {
    User.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/auth/login').send({ email: 'w@w.com' });
    expect(res.statusCode).toEqual(400);
  });
  it('6. Profile update', async () => {
    const res = await request(app).put('/api/auth/profile').send({ age: 25 });
    expect(res.statusCode).toEqual(200);
  });
});

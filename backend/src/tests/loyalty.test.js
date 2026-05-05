const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const User = require('../models/User');

const testUserId = '60d21b4667d0d8992e610c85';

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: '60d21b4667d0d8992e610c85', role: 'admin' };
    next();
  },
  admin: (req, res, next) => next()
}));

const loyaltyRoutes = require('../routes/loyaltyRoutes');
const { connectDB, closeDB } = require('./setup');

const app = express();
app.use(express.json());
app.use('/api/loyalty', loyaltyRoutes);

describe('Loyalty API', () => {
  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await LoyaltyTransaction.deleteMany({});
    
    const user = new User({
        _id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
        loyaltyPoints: 0
    });
    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await LoyaltyTransaction.deleteMany({});
    await closeDB();
  });

  test('Should add loyalty points', async () => {
    const data = {
      points: 50,
      description: 'Test points'
    };

    const res = await request(app)
      .post('/api/loyalty/add')
      .send(data);

    expect(res.statusCode).toEqual(201);
    expect(res.body.points).toBe(50);
  });

  test('Should get loyalty balance and history', async () => {
    const res = await request(app).get('/api/loyalty');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('totalPoints');
  });
});

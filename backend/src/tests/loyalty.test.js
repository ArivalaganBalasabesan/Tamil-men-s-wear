const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const loyaltyRoutes = require('../routes/loyaltyRoutes');

const app = express();
app.use(express.json());
app.use('/api/loyalty', (req, res, next) => {
  req.user = { id: new mongoose.Types.ObjectId().toString(), role: 'user' };
  next();
}, loyaltyRoutes);

describe('Loyalty API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamil_test');
  });

  afterAll(async () => {
    await LoyaltyTransaction.deleteMany({});
    await mongoose.connection.close();
  });

  test('Should add loyalty points', async () => {
    const data = {
      points: 50,
      description: 'First Purchase',
      orderId: new mongoose.Types.ObjectId().toString()
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
    expect(res.body.transactions.length).toBeGreaterThan(0);
  });
});

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Promotion = require('../models/Promotion');
const promoRoutes = require('../routes/promotionRoutes');
const { connectDB, closeDB } = require('./setup'); // Assuming a setup file exists

const app = express();
app.use(express.json());
// Mock middleware
app.use('/api/promotions', (req, res, next) => {
  req.user = { id: '60d21b4667d0d8992e610c85', role: 'admin' };
  next();
}, promoRoutes);

describe('Promotion API', () => {
  beforeAll(async () => {
    // Setup test DB connection
    process.env.JWT_SECRET = 'testsecret';
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tamil_test');
  });

  afterAll(async () => {
    await Promotion.deleteMany({});
    await mongoose.connection.close();
  });

  test('Should create a new promotion', async () => {
    const promoData = {
      code: 'WELCOME10',
      discountType: 'Percentage',
      discountValue: 10,
      expiryDate: new Date(Date.now() + 86400000).toISOString()
    };

    const res = await request(app)
      .post('/api/promotions')
      .send(promoData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.code).toBe('WELCOME10');
  });

  test('Should reject duplicate codes', async () => {
    const promoData = {
      code: 'WELCOME10',
      discountType: 'Percentage',
      discountValue: 10,
      expiryDate: new Date(Date.now() + 86400000).toISOString()
    };

    const res = await request(app)
      .post('/api/promotions')
      .send(promoData);

    expect(res.statusCode).toEqual(400);
  });

  test('Should fetch all promotions', async () => {
    const res = await request(app).get('/api/promotions');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});

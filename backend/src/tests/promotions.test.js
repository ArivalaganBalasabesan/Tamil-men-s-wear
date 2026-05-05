const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Promotion = require('../models/Promotion');

// Mock auth middleware BEFORE requiring routes
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: '60d21b4667d0d8992e610c85', role: 'admin' };
    next();
  },
  admin: (req, res, next) => next()
}));

const promoRoutes = require('../routes/promotionRoutes');
const { connectDB, closeDB } = require('./setup');

const app = express();
app.use(express.json());
app.use('/api/promotions', promoRoutes);

describe('Promotion API', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await Promotion.deleteMany({});
    await closeDB();
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

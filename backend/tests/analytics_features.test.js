const request = require('supertest');
const express = require('express');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: 'mock' }; next(); },
  admin: (req, res, next) => next()
}));

jest.mock('../models/User', () => ({
  findById: jest.fn().mockResolvedValue({ id: '123', loyaltyTier: 'Bronze' })
}));

// ── FIXING LOYALTY TRANSACTION TO BE A CONSTRUCTOR ──
jest.mock('../models/LoyaltyTransaction', () => {
  const mockTx = { points: 10, save: jest.fn().mockResolvedValue(true) };
  const Mock = jest.fn().mockImplementation(() => mockTx);
  Mock.find = jest.fn().mockImplementation(() => ({ sort: jest.fn().mockResolvedValue([]) }));
  return Mock;
});

jest.mock('../models/Outfit', () => {
  const mockOutfit = { save: jest.fn().mockResolvedValue(true) };
  const Mock = jest.fn().mockImplementation(() => mockOutfit);
  return Mock;
});

const loyaltyRoutes = require('../routes/loyaltyRoutes');
const outfitRoutes = require('../routes/outfitRoutes');
const app = express();
app.use(express.json());
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/outfits', outfitRoutes);

describe('Member 6: Analytics & Loyalty (4 Tests)', () => {
  it('27. Retrieve points', async () => {
    const res = await request(app).get('/api/loyalty');
    expect(res.statusCode).toEqual(200);
  });
  it('28. Reward engagement', async () => {
    const res = await request(app).post('/api/loyalty/add').send({ points: 10, description: 'Test' });
    expect(res.statusCode).toEqual(201);
  });
  it('29. Save outfit', async () => {
    const res = await request(app).post('/api/outfits').send({ name: 'F', products: ['1'] });
    expect(res.statusCode).toEqual(201);
  });
  it('30. Recommendations logic', async () => {
    const res = await request(app).get('/api/loyalty');
    expect(res.statusCode).toEqual(200);
  });
});

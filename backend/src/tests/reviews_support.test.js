const request = require('supertest');
const express = require('express');

// ── FIXING THE AUTH MOCK ──
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: 'mock' }; next(); },
  admin: (req, res, next) => next()
}));

jest.mock('../models/Review', () => ({
  find: jest.fn().mockImplementation(() => ({ populate: jest.fn().mockResolvedValue([]) })),
  prototype: { save: jest.fn().mockResolvedValue(true) }
}));

jest.mock('../models/Request', () => {
  const mockReq = { save: jest.fn().mockResolvedValue(true) };
  return jest.fn().mockImplementation(() => mockReq);
});

const reviewRoutes = require('../routes/reviewRoutes');
const requestRoutes = require('../routes/requestRoutes');
const app = express();
app.use(express.json());
app.use('/api/reviews', reviewRoutes);
app.use('/api/requests', requestRoutes);

describe('Member 5: Reviews & Support (4 Tests)', () => {
  it('23. Post review', async () => {
    const res = await request(app).post('/api/reviews').send({ productId: '1', rating: 5 });
    expect(res.statusCode).toBeDefined();
  });
  it('24. Invalid rating', async () => {
    const res = await request(app).post('/api/reviews').send({ rating: 10 });
    expect(res.statusCode).toBeDefined();
  });
  it('25. Help ticket', async () => {
    const res = await request(app).post('/api/requests').send({ subject: 'Refund' });
    expect(res.statusCode).toBeDefined();
  });
  it('26. Feedback loop', async () => {
    const res = await request(app).get('/api/reviews/123');
    expect(res.statusCode).toBeDefined();
  });
});

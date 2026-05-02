const request = require('supertest');
const express = require('express');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: 'admin', role: 'admin' }; next(); },
  admin: (req, res, next) => next()
}));

jest.mock('../models/Product', () => {
  const mockProduct = { _id: '1', name: 'S', save: jest.fn().mockResolvedValue({ _id: '1', name: 'S' }) };
  const Mock = jest.fn().mockImplementation(() => mockProduct);
  Mock.find = jest.fn().mockReturnValue({ limit: jest.fn().mockResolvedValue([{ name: 'S', price: 10 }]) });
  Mock.findById = jest.fn().mockResolvedValue(mockProduct);
  Mock.findByIdAndUpdate = jest.fn().mockResolvedValue(mockProduct);
  Mock.findByIdAndDelete = jest.fn().mockResolvedValue(true);
  return Mock;
});

const productRoutes = require('../routes/products');
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Member 2: Products & Category (6 Tests)', () => {
  it('7. List', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
  });
  it('8. Single', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.statusCode).toBeDefined();
  });
  it('9. Create', async () => {
    const res = await request(app).post('/api/products').send({ name: 'S', price: 10 });
    expect(res.statusCode).toEqual(200);
  });
  it('10. Filter', async () => {
    const res = await request(app).get('/api/products/recommendations?occasion=wedding');
    expect(res.statusCode).toEqual(200);
  });
  it('11. Update', async () => {
    const res = await request(app).put('/api/products/1').send({ price: 20 });
    expect(res.statusCode).toEqual(200);
  });
  it('12. Delete', async () => {
    const res = await request(app).delete('/api/products/1');
    expect(res.statusCode).toEqual(200);
  });
});

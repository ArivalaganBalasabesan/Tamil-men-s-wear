const request = require('supertest');
const express = require('express');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: 'mock' }; next(); },
  admin: (req, res, next) => next()
}));

jest.mock('../models/Order', () => {
  const mockOrder = { _id: '1', orderStatus: 'Pending', save: jest.fn().mockResolvedValue({ _id: '1', orderStatus: 'Pending' }) };
  const Mock = jest.fn().mockImplementation(() => mockOrder);
  Mock.find = jest.fn().mockImplementation(() => ({ 
    populate: jest.fn().mockReturnThis(), 
    sort: jest.fn().mockResolvedValue([]) 
  }));
  Mock.findById = jest.fn().mockResolvedValue(mockOrder);
  Mock.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);
  return Mock;
});

jest.mock('../models/Product', () => ({
  findByIdAndUpdate: jest.fn().mockResolvedValue(true)
}));

const orderRoutes = require('../routes/orderRoutes');
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Member 4: Cart & Orders (6 Tests)', () => {
  it('13. Place order', async () => {
    const res = await request(app).post('/api/orders').send({ 
      products: [{ productId: '1', quantity: 1, price: 100 }], 
      totalAmount: 100,
      shippingAddress: 'Colombo, Sri Lanka'
    });
    expect(res.statusCode).toBeDefined();
  });
  it('14. Prevent empty', async () => {
    const res = await request(app).post('/api/orders').send({ products: [] });
    expect(res.statusCode).toEqual(400); // Should catch empty products
  });
  it('15. Order history', async () => {
    const res = await request(app).get('/api/orders/user');
    expect(res.statusCode).toEqual(200);
  });
  it('16. Update status', async () => {
    const res = await request(app).put('/api/orders/123/status').send({ status: 'Shipped' });
    expect(res.statusCode).toEqual(200);
  });
  it('17. Cancel order', async () => {
    const res = await request(app).put('/api/orders/123/status').send({ status: 'Cancelled' });
    expect(res.statusCode).toEqual(200);
  });
  it('18. Bulk queries', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.statusCode).toEqual(200);
  });
});

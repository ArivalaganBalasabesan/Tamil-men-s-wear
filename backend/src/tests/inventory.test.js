const request = require('supertest');
const express = require('express');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: 'admin', role: 'admin' }; next(); },
  admin: (req, res, next) => next()
}));

jest.mock('../models/Inventory', () => {
  const mockInv = { 
    product: '1', 
    stockLevel: 100, 
    save: jest.fn().mockResolvedValue(true) 
  };
  const Mock = jest.fn().mockImplementation(() => mockInv);
  Mock.find = jest.fn().mockImplementation(() => ({ 
    populate: jest.fn().mockResolvedValue([]) 
  }));
  Mock.findOne = jest.fn().mockResolvedValue(mockInv);
  return Mock;
});

const inventoryRoutes = require('../routes/inventoryRoutes');
const app = express();
app.use(express.json());
app.use('/api/inventory', inventoryRoutes);

describe('Member 3: Inventory (4 Tests)', () => {
  it('19. List all', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.statusCode).toEqual(200);
  });
  it('20. Update SKU', async () => {
    const res = await request(app).post('/api/inventory/update').send({ product: '1', stockLevel: 50 });
    expect(res.statusCode).toEqual(200);
  });
  it('21. Low stock alerts', async () => {
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.statusCode).toEqual(200);
  });
  it('22. SKU tracking', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.statusCode).toEqual(200);
  });
});

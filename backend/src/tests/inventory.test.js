const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Product = require('../models/Product');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: '60d21b4667d0d8992e610c85', role: 'admin' }; next(); },
  admin: (req, res, next) => next()
}));

const inventoryRoutes = require('../routes/inventoryRoutes');
const { connectDB, closeDB } = require('./setup');
const app = express();
app.use(express.json());
app.use('/api/inventory', inventoryRoutes);

describe('Member 3: Inventory API', () => {
  let productId;

  beforeAll(async () => {
    await connectDB();
    await Inventory.deleteMany({});
    await Product.deleteMany({});
    
    const product = new Product({ name: 'Stock Item', price: 100, category: 'Test', stock: 50 });
    await product.save();
    productId = product._id;
  });

  afterAll(async () => {
    await Inventory.deleteMany({});
    await Product.deleteMany({});
    await closeDB();
  });

  it('Should list all inventory', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('Should update stock/threshold', async () => {
    const res = await request(app).post('/api/inventory/update').send({ 
      product: productId, 
      stockLevel: 20,
      lowStockThreshold: 10
    });
    if (res.statusCode !== 200) {
        console.log('Update Error:', res.body);
    }
    expect(res.statusCode).toEqual(200);
  });

  it('Should get low stock alerts', async () => {
    const res = await request(app).get('/api/inventory/low-stock');
    expect(res.statusCode).toEqual(200);
  });
});

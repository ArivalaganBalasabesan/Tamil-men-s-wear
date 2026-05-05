const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory'); 
const Product = require('../models/Product');

jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => { req.user = { id: '60d21b4667d0d8992e610c85', role: 'admin' }; next(); },
  admin: (req, res, next) => next()
}));

const productRoutes = require('../routes/products');
const { connectDB, closeDB } = require('./setup');
const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Member 2: Products & Category', () => {
  let testProductId;

  beforeAll(async () => {
    await connectDB();
    await Inventory.deleteMany({});
    await Product.deleteMany({});
  });

  afterAll(async () => {
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    await closeDB();
  });

  it('Create Product', async () => {
    const res = await request(app).post('/api/products').send({ 
      name: 'Test Shirt', 
      price: 1500, 
      category: 'Shirts',
      description: 'Test Desc',
      stock: 10
    });
    
    if (res.statusCode !== 200 && res.statusCode !== 201) {
        console.log('Create Failed:', res.text);
    }
    expect([200, 201]).toContain(res.statusCode);
    testProductId = res.body._id;
    expect(testProductId).toBeDefined();
  });

  it('List Products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('Get Single Product', async () => {
    const res = await request(app).get(`/api/products/${testProductId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toBe('Test Shirt');
  });

  it('Update Product', async () => {
    const res = await request(app).put(`/api/products/${testProductId}`).send({ price: 2000 });
    expect(res.statusCode).toEqual(200);
    expect(res.body.price).toBe(2000);
  });

  it('Delete Product', async () => {
    const res = await request(app).delete(`/api/products/${testProductId}`);
    expect(res.statusCode).toEqual(200);
  });
});

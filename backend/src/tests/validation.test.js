const { validateRegistration } = require('../validations/authValidation');
const { validateProduct } = require('../validations/productValidation');
const { validateOrder } = require('../validations/orderValidation');
const { validatePromotion } = require('../validations/promotionValidation');

describe('System Validations', () => {

  test('Auth: should reject invalid email and short password', () => {
    const result = validateRegistration({ name: 'Test', email: 'invalid', password: '123', phone: '123' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Please enter a valid email');
    expect(result.errors).toContain('Password must be at least 6 characters');
    expect(result.errors).toContain('Phone number must be exactly 10 digits');
  });

  test('Product: should reject names with numbers', () => {
    const result = validateProduct({ name: 'Shirt 101', price: 100, category: 'Test' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Product name should not contain numbers');
  });

  test('Order: should reject empty product list', () => {
    const result = validateOrder({ products: [], shippingAddress: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Order must contain at least one product');
    expect(result.errors).toContain('Shipping address is required');
  });

  test('Promotion: should reject past expiry date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const result = validatePromotion({ code: 'OLD', discountType: 'fixed', discountValue: 10, expiryDate: pastDate });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Expiry date must be in the future');
  });

});

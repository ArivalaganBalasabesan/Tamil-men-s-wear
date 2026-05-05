/**
 * Validation Test Suite
 * Run this to verify the validation logic
 */

const { validateRegistration } = require('./src/validations/authValidation');
const { validateProduct } = require('./src/validations/productValidation');
const { validateOrder } = require('./src/validations/orderValidation');
const { validatePromotion } = require('./src/validations/promotionValidation');

console.log('🚀 Starting Validation Tests...\n');

// 1. Auth Validation
console.log('--- Auth Validation ---');
const auth1 = validateRegistration({ name: 'John', email: 'john@gmail.com', password: 'password123', phone: '0771234567' });
console.log('Valid Case:', auth1.isValid ? '✅ PASS' : '❌ FAIL');

const auth2 = validateRegistration({ name: 'John', email: 'invalid-email', password: '123', phone: '123' });
console.log('Invalid Case (Errors):', auth2.errors.join(', '));
console.log('');

// 2. Product Validation
console.log('--- Product Validation ---');
const prod1 = validateProduct({ name: 'Blue Denim Jeans', price: 2500, category: 'Casual' });
console.log('Valid Name:', prod1.isValid ? '✅ PASS' : '❌ FAIL');

const prod2 = validateProduct({ name: 'Shirt 01', price: 1500, category: 'Formal' });
console.log('Invalid Name (with numbers):', prod2.isValid ? '❌ FAIL' : '✅ PASS (Caught: ' + prod2.errors[0] + ')');
console.log('');

// 3. Order Validation
console.log('--- Order Validation ---');
const order1 = validateOrder({ 
  products: [{ productId: '123', quantity: 1 }], 
  customerEmail: 'test@test.com', 
  customerPhone: '0112233445',
  shippingAddress: 'Colombo, Sri Lanka'
});
console.log('Valid Order:', order1.isValid ? '✅ PASS' : '❌ FAIL');

const order2 = validateOrder({ products: [], customerPhone: '123' });
console.log('Invalid Order (Errors):', order2.errors.join(', '));
console.log('');

// 4. Promotion Validation
console.log('--- Promotion Validation ---');
const promo1 = validatePromotion({ code: 'SAVE10', discountType: 'percentage', discountValue: 10, expiryDate: '2028-12-31' });
console.log('Valid Promotion:', promo1.isValid ? '✅ PASS' : '❌ FAIL');

const promo2 = validatePromotion({ code: 'EXPIRED', discountType: 'fixed', discountValue: 0, expiryDate: '2020-01-01' });
console.log('Invalid Promotion (Errors):', promo2.errors.join(', '));
console.log('');

console.log('🏁 Validation Tests Completed.');

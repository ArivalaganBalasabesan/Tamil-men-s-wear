/**
 * Order Validation Rules
 */

const validateOrder = (data) => {
  const errors = [];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!data.products || data.products.length === 0) {
    errors.push('Order must contain at least one product');
  }

  if (data.customerEmail && !emailRegex.test(data.customerEmail)) {
    errors.push('Please enter a valid customer email');
  }

  if (data.customerPhone && !/^\d{10}$/.test(data.customerPhone)) {
    errors.push('Customer phone number must be exactly 10 digits');
  }

  if (!data.shippingAddress) {
    errors.push('Shipping address is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateOrder
};

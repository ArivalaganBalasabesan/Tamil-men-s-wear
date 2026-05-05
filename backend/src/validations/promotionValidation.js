/**
 * Promotion Validation Rules
 */

const validatePromotion = (data) => {
  const errors = [];

  if (!data.code) errors.push('Promotion code is required');
  if (!data.discountType) errors.push('Discount type is required');
  if (data.discountValue === undefined || data.discountValue <= 0) {
    errors.push('Discount value must be greater than 0');
  }

  if (data.expiryDate && new Date(data.expiryDate) <= new Date()) {
    errors.push('Expiry date must be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validatePromotion
};

// Basic validation logic
const validateProduct = (data) => {
  const errors = [];
  if (!data.name) errors.push('Name is required');
  if (!data.price || data.price <= 0) errors.push('Valid price is required');
  if (!data.category) errors.push('Category is required');
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateProduct
};

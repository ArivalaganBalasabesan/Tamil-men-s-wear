// Product validation logic
const validateProduct = (data) => {
  const errors = [];
  
  if (!data.name) {
    errors.push('Name is required');
  } else if (/[0-9]/.test(data.name)) {
    errors.push('Product name should not contain numbers');
  }

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

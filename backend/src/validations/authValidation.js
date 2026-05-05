/**
 * Auth Validation Rules
 */

const validateRegistration = (data) => {
  const errors = [];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!data.name) errors.push('Name is required');
  if (!data.email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(data.email)) {
    errors.push('Please enter a valid email');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (data.phone && !/^\d{10}$/.test(data.phone)) {
    errors.push('Phone number must be exactly 10 digits');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateRegistration
};

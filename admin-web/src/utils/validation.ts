/**
 * Centralized validation utilities for Tamil Men's Wear Admin Dashboard
 */

// Email validation
export const validateEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// Phone number validation (exactly 10 digits)
export const validatePhone = (phone: string): boolean => {
  const re = /^\d{10}$/;
  return re.test(String(phone).trim());
};

// Password validation (min 6 characters, letters or numbers)
export const validatePassword = (password: string): boolean => {
  const re = /^[a-zA-Z0-9]{6,}$/;
  return re.test(String(password));
};

// Date validation (must be in the future)
export const isFutureDate = (date: string | Date): boolean => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

// Product Name validation (No numbers allowed)
export const validateProductName = (name: string): boolean => {
  const re = /^[^0-9]+$/;
  return re.test(String(name).trim());
};

// Price validation (must be greater than 0)
export const validatePrice = (price: number): boolean => {
  return price > 0;
};

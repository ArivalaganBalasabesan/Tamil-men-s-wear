// Email validation regex
export const validateEmail = (email: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// Phone number validation (exactly 10 digits)
export const validatePhone = (phone: string) => {
  const re = /^\d{10}$/;
  return re.test(String(phone).trim());
};

// General empty field check
export const isNotEmpty = (value: any) => {
  return value !== undefined && value !== null && String(value).trim() !== '';
};

// Password length validation (min 6 characters, letters or numbers)
export const validatePassword = (password: string) => {
  const re = /^[a-zA-Z0-9]{6,}$/;
  return re.test(String(password));
};

// Date validation (must be greater than today)
export const isFutureDate = (date: string | Date) => {
  const d = new Date(date);
  const now = new Date();
  return d > now;
};

// Product Name validation (No numbers allowed)
export const validateProductName = (name: string) => {
  const re = /^[^0-9]+$/;
  return re.test(String(name).trim());
};

// Validation utility functions for forms

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's a valid phone number (7-15 digits)
  return cleanPhone.length >= 7 && cleanPhone.length <= 15;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

export const handlePhoneChange = (value: string, setter: (value: string) => void) => {
  // Only allow digits
  const cleanValue = value.replace(/\D/g, '');
  setter(cleanValue);
};

export const handleEmailChange = (value: string, setter: (value: string) => void) => {
  // Allow email characters
  setter(value);
};

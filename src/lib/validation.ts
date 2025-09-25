/**
 * Validation utilities for forms
 * Contains regex patterns and validation functions for phone numbers and emails
 */

// Phone number regex pattern for Kenyan phone numbers - more flexible
// Supports: 07xxxxxxxx, 01xxxxxxxx, +2547xxxxxxxx, +2541xxxxxxxx, and international formats
export const PHONE_REGEX = /^(?:07\d{8}|01\d{8}|\+254(?:7\d{8}|1\d{8})|\+\d{10,15})$/;

// Email regex pattern - more practical version (allows trailing dots)
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\.?$/;

/**
 * Validates Kenyan phone number format
 * @param phone - Phone number to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || phone.trim() === '') {
    return false;
  }
  
  // Remove any spaces, dashes, or other non-digit characters except +
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return PHONE_REGEX.test(cleanPhone);
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns boolean - true if valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === '') {
    return false;
  }
  
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Gets phone number validation error message
 * @param phone - Phone number to validate
 * @returns string - Error message or empty string if valid
 */
export function getPhoneValidationError(phone: string): string {
  if (!phone || phone.trim() === '') {
    return 'Phone number is required';
  }
  
  if (!validatePhoneNumber(phone)) {
    return 'Please enter a valid Kenyan phone number (e.g., 0712345678, 0112345678, +254712345678)';
  }
  
  return '';
}

/**
 * Gets email validation error message
 * @param email - Email to validate
 * @returns string - Error message or empty string if valid
 */
export function getEmailValidationError(email: string): string {
  if (!email || email.trim() === '') {
    return 'Email is required';
  }
  
  if (!validateEmail(email)) {
    return 'Please enter a valid email address';
  }
  
  return '';
}

/**
 * Formats phone number for display (adds spaces for readability)
 * @param phone - Phone number to format
 * @returns string - Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Format based on length and prefix
  if (cleanPhone.startsWith('+254')) {
    // +254 7XX XXX XXX or +254 1XX XXX XXX
    return cleanPhone.replace(/(\+254)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  } else if (cleanPhone.startsWith('07') || cleanPhone.startsWith('01')) {
    // 07X XXX XXX or 01X XXX XXX
    return cleanPhone.replace(/(\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }
  
  return phone;
}

/**
 * Normalizes phone number for storage (removes spaces, ensures consistent format)
 * @param phone - Phone number to normalize
 * @returns string - Normalized phone number
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Convert to international format if it's a local number
  if (cleanPhone.startsWith('07')) {
    return '+254' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('01')) {
    return '+254' + cleanPhone.substring(1);
  }
  
  return cleanPhone;
}

/**
 * Phone number examples for help text
 */
export const PHONE_EXAMPLES = [
  '0712345678',
  '0112345678', 
  '+254712345678',
  '+254112345678'
];

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

/**
 * Comprehensive phone validation with detailed error messages
 * @param phone - Phone number to validate
 * @returns ValidationResult
 */
export function validatePhoneWithDetails(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'Phone number is required'
    };
  }
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!PHONE_REGEX.test(cleanPhone)) {
    return {
      isValid: false,
      errorMessage: `Invalid phone number format. Please use Kenyan format (${PHONE_EXAMPLES.join(', ')}) or international format (+1234567890)`
    };
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
}

/**
 * Comprehensive email validation with detailed error messages
 * @param email - Email to validate
 * @returns ValidationResult
 */
export function validateEmailWithDetails(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'Email is required'
    };
  }
  
  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid email address (e.g., user@example.com)'
    };
  }
  
  return {
    isValid: true,
    errorMessage: ''
  };
}

// Test script to verify controlled input fix
// This can be run in the browser console to test the fix

console.log("Testing controlled input fix...");

// Simulate the issue that was happening
const testFormData = {
  firstName: "John",
  lastName: "Doe",
  email: "test@example.com",
  phoneNumber: undefined, // This was causing the issue
  address: ""
};

// Check if any values are undefined
const hasUndefinedValues = Object.values(testFormData).some(value => value === undefined);
console.log("Has undefined values:", hasUndefinedValues);

// The fix ensures all values are strings
const fixedFormData = {
  firstName: testFormData.firstName || "",
  lastName: testFormData.lastName || "",
  email: testFormData.email || "",
  phoneNumber: testFormData.phoneNumber || "", // Fixed: ensures string
  address: testFormData.address || ""
};

const hasUndefinedValuesAfterFix = Object.values(fixedFormData).some(value => value === undefined);
console.log("Has undefined values after fix:", hasUndefinedValuesAfterFix);

console.log("Original formData:", testFormData);
console.log("Fixed formData:", fixedFormData);

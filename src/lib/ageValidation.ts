// Age validation utilities for sport assignments

export interface AgeGroup {
  min: number;
  max: number;
  label: string;
}

// Age group definitions
export const AGE_GROUPS: AgeGroup[] = [
  { min: 0, max: 9, label: "U9" },
  { min: 10, max: 11, label: "U11" },
  { min: 12, max: 13, label: "U13" },
  { min: 14, max: 15, label: "U15" },
  { min: 16, max: 17, label: "U17" },
  { min: 18, max: 19, label: "U19" },
  { min: 20, max: 23, label: "20-23" },
  { min: 24, max: 26, label: "24-26" },
  { min: 27, max: 29, label: "27-29" },
  { min: 30, max: 35, label: "30-35" },
  { min: 36, max: 40, label: "36-40" },
  { min: 41, max: 45, label: "41-45" },
  { min: 46, max: 50, label: "46-50" },
  { min: 51, max: 100, label: "51+" }
];

// Alternative age group format (used in some components)
export const AGE_GROUPS_ALT: AgeGroup[] = [
  { min: 0, max: 12, label: "Under 12" },
  { min: 12, max: 14, label: "12-14" },
  { min: 15, max: 17, label: "15-17" },
  { min: 18, max: 20, label: "18-20" },
  { min: 21, max: 23, label: "21-23" },
  { min: 24, max: 26, label: "24-26" },
  { min: 27, max: 29, label: "27-29" },
  { min: 30, max: 35, label: "30-35" },
  { min: 36, max: 40, label: "36-40" },
  { min: 41, max: 45, label: "41-45" },
  { min: 46, max: 50, label: "46-50" },
  { min: 51, max: 100, label: "51+" }
];

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string | Date): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Get age group for a given age
 */
export function getAgeGroup(age: number, useAltFormat: boolean = false): AgeGroup | null {
  const groups = useAltFormat ? AGE_GROUPS_ALT : AGE_GROUPS;
  return groups.find(group => age >= group.min && age <= group.max) || null;
}

/**
 * Check if a student's age matches the required age group
 */
export function validateAgeForAgeGroup(
  studentAge: number, 
  requiredAgeGroup: string, 
  useAltFormat: boolean = false
): { isValid: boolean; message?: string } {
  const groups = useAltFormat ? AGE_GROUPS_ALT : AGE_GROUPS;
  
  // Find the required age group
  const requiredGroup = groups.find(group => group.label === requiredAgeGroup);
  
  if (!requiredGroup) {
    return { 
      isValid: false, 
      message: `Invalid age group: ${requiredAgeGroup}` 
    };
  }
  
  // Check if student's age falls within the required range
  if (studentAge >= requiredGroup.min && studentAge <= requiredGroup.max) {
    return { isValid: true };
  }
  
  return { 
    isValid: false, 
    message: `Student age ${studentAge} does not match age group ${requiredAgeGroup} (${requiredGroup.min}-${requiredGroup.max} years)` 
  };
}

/**
 * Get all valid age groups for a student's age
 */
export function getValidAgeGroups(studentAge: number, useAltFormat: boolean = false): AgeGroup[] {
  const groups = useAltFormat ? AGE_GROUPS_ALT : AGE_GROUPS;
  return groups.filter(group => studentAge >= group.min && studentAge <= group.max);
}

/**
 * Parse age group string to extract min/max values
 */
export function parseAgeGroup(ageGroupString: string): { min: number; max: number } | null {
  // Handle U format (U9, U11, etc.)
  if (ageGroupString.startsWith('U')) {
    const maxAge = parseInt(ageGroupString.substring(1));
    if (!isNaN(maxAge)) {
      return { min: 0, max: maxAge };
    }
  }
  
  // Handle range format (12-14, 18-20, etc.)
  const rangeMatch = ageGroupString.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1]);
    const max = parseInt(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  }
  
  // Handle "Under X" format
  const underMatch = ageGroupString.match(/Under (\d+)/);
  if (underMatch) {
    const maxAge = parseInt(underMatch[1]);
    if (!isNaN(maxAge)) {
      return { min: 0, max: maxAge - 1 };
    }
  }
  
  // Handle "X+" format
  const plusMatch = ageGroupString.match(/(\d+)\+/);
  if (plusMatch) {
    const minAge = parseInt(plusMatch[1]);
    if (!isNaN(minAge)) {
      return { min: minAge, max: 100 };
    }
  }
  
  return null;
}

/**
 * FIX #11: Form Validation Hook
 * Provides reusable validation logic for checkout and other forms
 */

import { useState, useCallback } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: ValidationRules
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    if (rule.required && !value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters`;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return `Must be no more than ${rule.maxLength} characters`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return `Invalid format`;
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(name => {
      const error = validateField(name, values[name] || '');
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  }, [rules, values, validateField]);

  const handleChange = useCallback((name: keyof T, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name as string]) {
      const error = validateField(name as string, value);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name] || '');
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  }, [values, validateField]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
    isValid: Object.keys(errors).every(key => !errors[key])
  };
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,
  pincode: /^\d{6}$/,
  name: /^[a-zA-Z\s]+$/,
};

// Common validation rules
export const commonRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        return 'Name should contain only letters';
      }
      return null;
    }
  },
  phone: {
    required: true,
    custom: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        return 'Phone must be 10 digits';
      }
      if (!/^[6-9]/.test(cleaned)) {
        return 'Phone must start with 6, 7, 8, or 9';
      }
      return null;
    }
  },
  email: {
    required: false,
    custom: (value: string) => {
      if (value && !validationPatterns.email.test(value)) {
        return 'Invalid email format';
      }
      return null;
    }
  },
  pincode: {
    required: true,
    custom: (value: string) => {
      if (!validationPatterns.pincode.test(value)) {
        return 'Pincode must be 6 digits';
      }
      return null;
    }
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 500,
  }
};
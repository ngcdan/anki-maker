// ===============================================================================
// FORM VALIDATION UTILITIES
// ===============================================================================

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => boolean;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateField = (value: any, rules: ValidationRule[]): ValidationResult => {
  const errors: string[] = [];

  for (const rule of rules) {
    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push(rule.message || 'Trường này là bắt buộc');
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      continue;
    }

    // String length validations
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(rule.message || `Tối thiểu ${rule.minLength} ký tự`);
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(rule.message || `Tối đa ${rule.maxLength} ký tự`);
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(rule.message || 'Định dạng không hợp lệ');
      }
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      errors.push(rule.message || 'Giá trị không hợp lệ');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ===============================================================================
// COMMON VALIDATION RULES
// ===============================================================================

export const VALIDATION_RULES = {
  REQUIRED: { required: true, message: 'Trường này là bắt buộc' },
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email không hợp lệ',
  },
  API_KEY: {
    required: true,
    minLength: 10,
    message: 'API key phải có ít nhất 10 ký tự',
  },
  DECK_NAME: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Tên deck phải từ 1-100 ký tự',
  },
  PROMPT: {
    required: true,
    minLength: 3,
    maxLength: 2000,
    message: 'Prompt phải từ 3-2000 ký tự',
  },
};

// ===============================================================================
// FORM VALIDATION HELPERS
// ===============================================================================

import { useState, useCallback, useEffect } from 'react';

export type FormValidationConfig<T> = {
  [K in keyof T]: ValidationRule[];
};

export interface UseFormValidationResult<T> {
  values: T;
  errors: Record<keyof T, string[]>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (event?: React.FormEvent) => Promise<void>;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationConfig: FormValidationConfig<T>
): UseFormValidationResult<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize errors object
  useEffect(() => {
    const initialErrors = {} as Record<keyof T, string[]>;
    Object.keys(initialValues).forEach(key => {
      initialErrors[key as keyof T] = [];
    });
    setErrors(initialErrors);
  }, []);

  const validateFieldExternal = useCallback((field: keyof T): boolean => {
    const value = values[field];
    const rules = validationConfig[field] || [];
    const result = validateField(value, rules);

    setErrors(prev => ({ ...prev, [field]: result.errors }));
    return result.isValid;
  }, [values, validationConfig]);

  const validateAll = useCallback((): boolean => {
    const newErrors = {} as Record<keyof T, string[]>;
    let isAllValid = true;

    Object.keys(values).forEach(key => {
      const field = key as keyof T;
      const value = values[field];
      const rules = validationConfig[field] || [];
      const result = validateField(value, rules);

      newErrors[field] = result.errors;
      if (!result.isValid) {
        isAllValid = false;
      }
    });

    setErrors(newErrors);
    return isAllValid;
  }, [values, validationConfig]);

  const handleChange = useCallback((field: keyof T) => (value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field] && errors[field].length > 0) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  }, [errors]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) =>
    async (event?: React.FormEvent) => {
      if (event) {
        event.preventDefault();
      }

      if (!validateAll()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateAll, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string[]>);
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: [error] }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => ({ ...prev, [field]: [] }));
  }, []);

  const isValid = Object.values(errors).every(fieldErrors => fieldErrors.length === 0);

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    handleChange,
    handleSubmit,
    validateField: validateFieldExternal,
    validateAll,
    reset,
    setFieldError,
    clearFieldError,
  };
};
// Form validation utilities and helpers

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
      if (rule.minLength && value.length < rule.minLength) {
        errors.push(rule.message || `Tối thiểu ${rule.minLength} ký tự`);
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(rule.message || `Tối đa ${rule.maxLength} ký tự`);
      }

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

// Common validation rules
export const VALIDATION_RULES = {
  required: (message?: string): ValidationRule => ({
    required: true,
    message: message || 'Trường này là bắt buộc',
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    minLength: length,
    message: message || `Tối thiểu ${length} ký tự`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    maxLength: length,
    message: message || `Tối đa ${length} ký tự`,
  }),

  openaiKey: (message?: string): ValidationRule => ({
    pattern: /^sk-[a-zA-Z0-9]{48,}$/,
    message: message || 'OpenAI API key không hợp lệ (phải bắt đầu với sk-)',
  }),

  notEmpty: (message?: string): ValidationRule => ({
    custom: (value: string) => value && value.trim().length > 0,
    message: message || 'Không được để trống',
  }),

  arrayNotEmpty: (message?: string): ValidationRule => ({
    custom: (value: any[]) => Array.isArray(value) && value.length > 0,
    message: message || 'Cần chọn ít nhất một mục',
  }),
};

// Validation schemas for common forms
export const VALIDATION_SCHEMAS = {
  promptForm: {
    prompt: [VALIDATION_RULES.required('Vui lòng nhập prompt'), VALIDATION_RULES.minLength(3)],
    deckName: [VALIDATION_RULES.required('Vui lòng chọn deck')],
    tags: [], // Tags are optional
  },

  openaiKey: {
    key: [
      VALIDATION_RULES.required('Vui lòng nhập OpenAI API key'),
      VALIDATION_RULES.openaiKey(),
    ],
  },

  noteCard: {
    Front: [VALIDATION_RULES.required('Front field không được để trống')],
    Back: [VALIDATION_RULES.required('Back field không được để trống')],
    Question: [], // Optional
    Ans: [], // Optional
    Audio: [], // Optional
  },
};

// Hook for form validation
import { useState, useCallback } from 'react';

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validationSchema: Record<keyof T, ValidationRule[]>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<keyof T, string[]>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: () => Promise<void>;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string[]>>({} as Record<keyof T, string[]>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateFieldInternal = useCallback((field: keyof T, value: any): ValidationResult => {
    const rules = validationSchema[field] || [];
    return validateField(value, rules);
  }, [validationSchema]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    // Clear errors when user starts typing
    if (errors[field] && errors[field].length > 0) {
      setErrors(prev => ({ ...prev, [field]: [] }));
    }
  }, [errors]);

  const validateFieldExternal = useCallback((field: keyof T): boolean => {
    const result = validateFieldInternal(field, values[field]);
    setErrors(prev => ({ ...prev, [field]: result.errors }));
    return result.isValid;
  }, [values, validateFieldInternal]);

  const validateAll = useCallback((): boolean => {
    const newErrors = {} as Record<keyof T, string[]>;
    let isFormValid = true;

    for (const field in validationSchema) {
      const result = validateFieldInternal(field, values[field]);
      newErrors[field] = result.errors;
      if (!result.isValid) {
        isFormValid = false;
      }
    }

    setErrors(newErrors);
    return isFormValid;
  }, [values, validationSchema, validateFieldInternal]);

  const handleSubmit = useCallback(async () => {
    if (!validateAll() || !onSubmit) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateAll, onSubmit]);

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
}
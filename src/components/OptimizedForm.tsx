import { memo, useMemo, useCallback, ReactNode } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { Send, Clear } from '@mui/icons-material';

interface FormField {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'select';
  options?: string[];
  multiline?: boolean;
  rows?: number;
}

interface OptimizedFormProps {
  title: string;
  fields: FormField[];
  onFieldChange: (key: string, value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
  clearLabel?: string;
  children?: ReactNode;
}

const OptimizedForm = memo<OptimizedFormProps>(({
  title,
  fields,
  onFieldChange,
  onSubmit,
  onClear,
  isLoading = false,
  submitLabel = 'Gửi',
  clearLabel = 'Xóa',
  children,
}) => {
  // Memoize form validation
  const isFormValid = useMemo(() => {
    return fields.every(field => field.value.trim() !== '');
  }, [fields]);

  // Memoize submit handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isLoading) {
      onSubmit();
    }
  }, [onSubmit, isFormValid, isLoading]);

  // Memoize clear handler
  const handleClear = useCallback(() => {
    if (onClear && !isLoading) {
      onClear();
    }
  }, [onClear, isLoading]);

  // Memoize field change handler
  const handleFieldChange = useCallback((key: string) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFieldChange(key, event.target.value);
    };
  }, [onFieldChange]);

  const handleSelectChange = useCallback((key: string) => {
    return (event: any) => {
      onFieldChange(key, event.target.value);
    };
  }, [onFieldChange]);

  // Memoize rendered fields
  const renderedFields = useMemo(() => {
    return fields.map((field) => {
      if (field.type === 'select' && field.options) {
        return (
          <FormControl key={field.key} fullWidth margin="normal">
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={field.value}
              label={field.label}
              onChange={handleSelectChange(field.key)}
              disabled={isLoading}
            >
              {field.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }

      return (
        <TextField
          key={field.key}
          fullWidth
          label={field.label}
          value={field.value}
          onChange={handleFieldChange(field.key)}
          margin="normal"
          multiline={field.multiline}
          rows={field.rows}
          disabled={isLoading}
        />
      );
    });
  }, [fields, handleFieldChange, handleSelectChange, isLoading]);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" height={56} sx={{ mt: 2 }} />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="rectangular" width={80} height={36} />
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {renderedFields}

      {children}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!isFormValid || isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <Send />}
        >
          {submitLabel}
        </Button>

        {onClear && (
          <Button
            type="button"
            variant="outlined"
            onClick={handleClear}
            disabled={isLoading}
            startIcon={<Clear />}
          >
            {clearLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
});

OptimizedForm.displayName = 'OptimizedForm';

export default OptimizedForm;
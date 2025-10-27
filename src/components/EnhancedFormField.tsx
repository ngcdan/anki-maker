import { memo, useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface EnhancedFormFieldProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  type?: 'text' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  placeholder?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  hint?: string;
  success?: boolean;
  loading?: boolean;
  clearable?: boolean;
}

const EnhancedFormField = memo<EnhancedFormFieldProps>(({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  multiline = false,
  rows = 4,
  maxLength,
  hint,
  success = false,
  loading = false,
  clearable = false,
}) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const handleClear = useCallback(() => {
    onChange(type === 'multiselect' ? [] : '');
  }, [onChange, type]);

  const getFieldColor = () => {
    if (error) return 'error';
    if (success) return 'success';
    return 'primary';
  };

  const getStatusIcon = () => {
    if (loading) return null;
    if (error) return <ErrorIcon color="error" />;
    if (success) return <CheckIcon color="success" />;
    return null;
  };

  const renderTextField = () => (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      error={!!error}
      disabled={disabled || loading}
      required={required}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      color={getFieldColor()}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      inputProps={{
        maxLength,
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getStatusIcon()}
              {hint && (
                <Tooltip title={hint} arrow>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {clearable && value && !disabled && (
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </InputAdornment>
        ),
        sx: {
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette[getFieldColor()].main, 0.5),
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: theme.palette[getFieldColor()].main,
            },
          },
          ...(focused && {
            boxShadow: `0 0 0 4px ${alpha(theme.palette[getFieldColor()].main, 0.1)}`,
          }),
        },
      }}
      sx={{
        '& .MuiInputLabel-root': {
          fontWeight: 500,
          '&.Mui-focused': {
            color: theme.palette[getFieldColor()].main,
          },
        },
      }}
    />
  );

  const renderSelect = () => (
    <FormControl
      fullWidth
      error={!!error}
      disabled={disabled || loading}
      color={getFieldColor()}
    >
      <InputLabel
        sx={{
          fontWeight: 500,
          '&.Mui-focused': {
            color: theme.palette[getFieldColor()].main,
          },
        }}
      >
        {label} {required && '*'}
      </InputLabel>
      <Select
        value={value}
        label={`${label}${required ? ' *' : ''}`}
        onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        endAdornment={
          <InputAdornment position="end">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 2 }}>
              {getStatusIcon()}
              {hint && (
                <Tooltip title={hint} arrow>
                  <IconButton size="small">
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </InputAdornment>
        }
        sx={{
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette[getFieldColor()].main, 0.5),
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: theme.palette[getFieldColor()].main,
            },
          },
          ...(focused && {
            boxShadow: `0 0 0 4px ${alpha(theme.palette[getFieldColor()].main, 0.1)}`,
          }),
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette[getFieldColor()].main, 0.1),
              },
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderMultiSelect = () => (
    <FormControl
      fullWidth
      error={!!error}
      disabled={disabled || loading}
      color={getFieldColor()}
    >
      <InputLabel
        sx={{
          fontWeight: 500,
          '&.Mui-focused': {
            color: theme.palette[getFieldColor()].main,
          },
        }}
      >
        {label} {required && '*'}
      </InputLabel>
      <Select
        multiple
        value={Array.isArray(value) ? value : []}
        label={`${label}${required ? ' *' : ''}`}
        onChange={(e: SelectChangeEvent<string[]>) => onChange(e.target.value as string[])}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((item) => (
              <Chip
                key={item}
                label={item}
                size="small"
                variant="outlined"
                color={getFieldColor()}
                sx={{
                  borderRadius: 2,
                  fontSize: '0.75rem',
                }}
              />
            ))}
          </Box>
        )}
        sx={{
          borderRadius: 3,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette[getFieldColor()].main, 0.5),
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: theme.palette[getFieldColor()].main,
            },
          },
          ...(focused && {
            boxShadow: `0 0 0 4px ${alpha(theme.palette[getFieldColor()].main, 0.1)}`,
          }),
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            sx={{
              '&:hover': {
                backgroundColor: alpha(theme.palette[getFieldColor()].main, 0.1),
              },
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const renderField = () => {
    switch (type) {
      case 'select':
        return renderSelect();
      case 'multiselect':
        return renderMultiSelect();
      case 'textarea':
        return renderTextField();
      default:
        return renderTextField();
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      {renderField()}

      {/* Helper Text & Character Count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <FormHelperText
          error={!!error}
          sx={{
            margin: 0,
            fontSize: '0.75rem',
            fontWeight: error ? 500 : 400,
          }}
        >
          {error || helperText}
        </FormHelperText>

        {maxLength && type !== 'select' && type !== 'multiselect' && (
          <Typography
            variant="caption"
            color={
              typeof value === 'string' && value.length > maxLength * 0.9
                ? 'warning.main'
                : 'text.secondary'
            }
            sx={{ fontSize: '0.75rem' }}
          >
            {typeof value === 'string' ? value.length : 0}/{maxLength}
          </Typography>
        )}
      </Box>
    </Box>
  );
});

EnhancedFormField.displayName = 'EnhancedFormField';

export default EnhancedFormField;
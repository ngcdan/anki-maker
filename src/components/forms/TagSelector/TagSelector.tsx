import React from 'react';
import { FormControl, TextField, Autocomplete } from '@mui/material';
import { FormComponentProps } from '../../../types';

interface TagSelectorProps extends FormComponentProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
  isLoading?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  value,
  onChange,
  options,
  isLoading = false,
  disabled = false,
  error,
  helperText,
}) => {
  const handleChange = (_: any, newValue: string[]) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <FormControl fullWidth disabled={disabled || isLoading} error={!!error}>
      <Autocomplete
        id="tags"
        multiple
        autoHighlight
        freeSolo
        value={value}
        options={options}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            error={!!error}
            helperText={helperText}
          />
        )}
        disabled={disabled || isLoading}
      />
    </FormControl>
  );
};
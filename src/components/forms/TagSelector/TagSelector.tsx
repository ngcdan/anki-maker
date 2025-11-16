import React from 'react';
import { FormControl, TextField, Autocomplete } from '@mui/material';
import { FormComponentProps } from '../../../shared';

interface TagSelectorProps extends FormComponentProps {
  value: string[];
  onChange: (value: string[]) => void;
  isLoading?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  value,
  onChange,
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
        freeSolo
        value={value}
        options={[]} // Không hiển thị gợi ý, chỉ cho phép thêm tags mới
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Thêm tags..."
            error={!!error}
            helperText={helperText}
          />
        )}
        disabled={disabled || isLoading}
      />
    </FormControl>
  );
};
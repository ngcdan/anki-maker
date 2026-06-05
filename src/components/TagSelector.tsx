import React from 'react';
import { FormControl, TextField, Autocomplete } from '@mui/material';

interface TagSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  isLoading?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  value,
  onChange,
  isLoading = false,
}) => {
  const handleChange = (_: any, newValue: string[]) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <FormControl fullWidth disabled={isLoading}>
      <Autocomplete
        id="tags"
        multiple
        freeSolo
        value={value}
        options={[]}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Thêm tags..."
          />
        )}
        disabled={isLoading}
      />
    </FormControl>
  );
};
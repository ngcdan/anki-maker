import React from 'react';
import { FormControl, TextField } from '@mui/material';
import { FormComponentProps } from '../../../types';

interface PromptInputProps extends FormComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  disabled = false,
  error,
  helperText,
  placeholder = 'Enter your prompt here...',
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth>
      <TextField
        id="prompt"
        label="Prompt"
        placeholder={placeholder}
        maxRows={10}
        multiline
        value={value}
        onChange={handleChange}
        disabled={disabled}
        error={!!error}
        helperText={helperText}
        variant="outlined"
      />
    </FormControl>
  );
};
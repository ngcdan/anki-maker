import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Send } from '@mui/icons-material';

interface AdvancedPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
}

export const AdvancedPromptInput: React.FC<AdvancedPromptInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  placeholder = "Nhập prompt để tạo flashcards...",
}) => {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled && !loading) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        background: 'background.paper',
        border: theme => `1px solid ${focused ? theme.palette.primary.main : theme.palette.divider}`,
        transition: 'border-color 0.2s ease',
      }}
    >
      <Box>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            variant="outlined"
            InputProps={{
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} />
                </InputAdornment>
              ) : undefined,
            }}
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '0.9rem',
                lineHeight: 1.4,
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!value.trim() || disabled || loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Send />}
              sx={{
                borderRadius: 1,
                textTransform: 'none',
                fontWeight: 500,
                px: 2,
                py: 0.75,
              }}
            >
              {loading ? 'Đang tạo...' : 'Tạo ghi chú'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
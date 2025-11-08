import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  InputAdornment,
  Fade,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Send, Psychology, Casino } from '@mui/icons-material';
import { getRandomPrompt } from '../../utils/samplePrompts';

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
    // Cho phép submit ngay cả khi value trống (sẽ dùng random prompt)
    if (!disabled && !loading) {
      onSubmit();
    }
  };

  const handleRandomPrompt = () => {
    if (!disabled && !loading) {
      const randomPrompt = getRandomPrompt();
      onChange(randomPrompt);
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
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
        border: theme => `2px solid ${focused ? theme.palette.primary.main : 'transparent'}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
          opacity: focused ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Psychology color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            AI Prompt
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
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
                  <Fade in={loading}>
                    <Box>
                      <CircularProgress size={20} />
                    </Box>
                  </Fade>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 1,
                },
                '&.Mui-focused': {
                  transform: 'translateY(-1px)',
                  boxShadow: 2,
                },
              },
              '& .MuiOutlinedInput-input': {
                fontSize: '1rem',
                lineHeight: 1.6,
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
              <Tooltip title="Random prompt">
                <IconButton
                  onClick={handleRandomPrompt}
                  disabled={disabled || loading}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Casino fontSize="small" />
                </IconButton>
              </Tooltip>              <Button
                type="submit"
                variant="contained"
                disabled={disabled || loading}
                startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  minWidth: 120,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'grey.300',
                  },
                }}
              >
                {loading ? 'Đang tạo...' : (value.trim() ? 'Tạo thẻ' : '🎲 Ngẫu nhiên')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
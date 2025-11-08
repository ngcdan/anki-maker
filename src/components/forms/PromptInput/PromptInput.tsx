import React, { useState } from 'react';
import { FormControl, TextField, Box, IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Casino } from '@mui/icons-material';
import { FormComponentProps } from '../../../types';
import { getRandomPrompt } from '../../../utils/samplePrompts';

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
  placeholder = 'Nhập prompt hoặc click 🎲...',
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const [randomPromptUsed, setRandomPromptUsed] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleRandomPrompt = () => {
    if (!disabled) {
      const randomPrompt = getRandomPrompt();
      onChange(randomPrompt);
      setRandomPromptUsed(randomPrompt.substring(0, 50) + '...');
      setShowNotification(true);
    }
  };

  return (
    <FormControl fullWidth>
      <Box sx={{ position: 'relative' }}>
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
          fullWidth
          InputProps={{
            endAdornment: (
              <Tooltip title="🎲 Random">
                <IconButton
                  onClick={handleRandomPrompt}
                  disabled={disabled}
                  size="small"
                  sx={{
                    width: 32,
                    height: 32,
                    minWidth: 32,
                    color: 'primary.main',
                    backgroundColor: 'transparent',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Casino fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          }}
        />
      </Box>

      <Snackbar
        open={showNotification}
        autoHideDuration={2500}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowNotification(false)}
          severity="success"
          sx={{
            width: 'auto',
            maxWidth: 350,
            fontSize: '0.875rem',
            '& .MuiAlert-message': { py: 0.5 }
          }}
        >
          🎲 {randomPromptUsed}
        </Alert>
      </Snackbar>
    </FormControl>
  );
};
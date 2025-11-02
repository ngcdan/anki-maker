import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Typography,
  Chip,
  Alert,
  Collapse,
  Button,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Key,
  ExpandMore,
  ExpandLess,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useOpenAIKey } from '../../../hooks/useOpenAI';

export const ApiKeyManager: React.FC = () => {
  const { openAIKey, setOpenAIKey, hasValidKey } = useOpenAIKey();
  const [showKey, setShowKey] = useState(false);
  const [expanded, setExpanded] = useState(!hasValidKey); // Auto expand if no valid key

  const handleKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAIKey(event.target.value);
  };

  const getKeyStatus = () => {
    if (!openAIKey) return { label: 'Chưa có', color: 'default' as const };
    if (hasValidKey) return { label: 'Hợp lệ', color: 'success' as const };
    return { label: 'Không hợp lệ', color: 'error' as const };
  };

  const status = getKeyStatus();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          p: 1,
          borderRadius: 1,
          '&:hover': { backgroundColor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Key color="primary" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            OpenAI API Key
          </Typography>
          <Chip label={status.label} color={status.color} size="small" />
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Expandable Content */}
      <Collapse in={expanded}>
        <Box sx={{ pt: 2, pb: 1 }}>
          {!hasValidKey && (
            <Alert severity="warning" sx={{ mb: 2, fontSize: '0.875rem' }}>
              Cần API key để tạo thẻ với AI
            </Alert>
          )}

          <TextField
            fullWidth
            size="small"
            type={showKey ? 'text' : 'password'}
            label="API Key"
            value={openAIKey}
            onChange={handleKeyChange}
            placeholder="sk-..."
            variant="outlined"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowKey(!showKey)}
                    edge="end"
                  >
                    {showKey ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            helperText={
              openAIKey
                ? hasValidKey
                  ? 'API key hợp lệ ✓'
                  : 'Key không hợp lệ (phải bắt đầu với sk-)'
                : 'Nhập OpenAI API key'
            }
            error={!!openAIKey && !hasValidKey}
          />

          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Lấy key từ{' '}
              <Link
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 'bold' }}
              >
                OpenAI
              </Link>
            </Typography>
            <Button
              size="small"
              startIcon={<SettingsIcon />}
              href="/settings"
              sx={{ textTransform: 'none', fontSize: '0.75rem' }}
            >
              Settings
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};
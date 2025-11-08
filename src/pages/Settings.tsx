import React, { useContext, useState } from 'react';
import {
  TextField,
  Typography,
  Link,
  Grid,
  Container,
  IconButton,
  InputAdornment,
  Alert,
  Box,
  Chip,

} from '@mui/material';
import { Visibility, VisibilityOff, ContentCopy, Check } from '@mui/icons-material';
import { OpenAIKeyContext } from '../OpenAIKeyContext';
import { AIConfigSettings } from '../components/AIConfigSettings';

function Settings() {
  const { openAIKey, setOpenAIKey } = useContext(OpenAIKeyContext);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleOpenAIKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOpenAIKey(event.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCopyKey = async () => {
    if (openAIKey) {
      await navigator.clipboard.writeText(openAIKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isValidKey = (key: string): boolean => {
    return key.startsWith('sk-') && key.length > 20;
  };

  return (
    <Container maxWidth="md">
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            Cài đặt
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các cài đặt cho ứng dụng tạo thẻ Anki
          </Typography>
        </Grid>

        <Grid item>
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              OpenAI API Settings
              {openAIKey && (
                <Chip
                  label={isValidKey(openAIKey) ? "Hợp lệ" : "Không hợp lệ"}
                  color={isValidKey(openAIKey) ? "success" : "error"}
                  size="small"
                />
              )}
            </Typography>

            <Typography variant="body2" sx={{ mb: 2 }}>
              Để tạo OpenAI API key, vui lòng làm theo hướng dẫn tại{' '}
              <Link
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 'bold' }}
              >
                trang này
              </Link>.
            </Typography>

            {!openAIKey && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Bạn cần nhập OpenAI API key để sử dụng tính năng tạo thẻ tự động.
              </Alert>
            )}

            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="OpenAI API Key"
              value={openAIKey}
              onChange={handleOpenAIKeyChange}
              placeholder="sk-..."
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {openAIKey && (
                      <IconButton
                        onClick={handleCopyKey}
                        edge="end"
                        sx={{ mr: 0.5 }}
                      >
                        {copied ? <Check color="success" /> : <ContentCopy />}
                      </IconButton>
                    )}
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText={
                openAIKey
                  ? isValidKey(openAIKey)
                    ? "API key hợp lệ ✓"
                    : "API key không hợp lệ. Key phải bắt đầu bằng 'sk-' và có độ dài phù hợp."
                  : "Nhập OpenAI API key của bạn"
              }
              error={openAIKey !== "" && !isValidKey(openAIKey)}
            />
          </Box>
        </Grid>

        {/* AI Configuration Settings */}
        <Grid item xs={12}>
          <AIConfigSettings />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Settings;
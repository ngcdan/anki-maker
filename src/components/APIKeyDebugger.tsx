import React from 'react';
import { Box, Alert, Button, Typography } from '@mui/material';
import { usePromptConfig } from '../contexts/PromptConfigContext';
import { useConfigurableOpenAI } from '../hooks/useConfigurableOpenAI';

export const APIKeyDebugger: React.FC = () => {
  const { currentConfig } = usePromptConfig();

  // Check localStorage directly
  const storedKey = localStorage.getItem('openAIKey') || '';
  const trimmedKey = storedKey.trim();
  const hasKey = trimmedKey.length > 0;

  // Simplified validation - accept both old and new formats
  const isOldFormat = trimmedKey.startsWith('sk-') && !trimmedKey.startsWith('sk-proj-');
  const isNewFormat = trimmedKey.startsWith('sk-proj-');
  const isValidFormat = isOldFormat || isNewFormat;

  const hasSpaces = storedKey !== trimmedKey; const generateTest = useConfigurableOpenAI({
    onSuccess: (notes) => {
      console.log('✅ Test successful:', notes);
    },
    onError: (error) => {
      console.error('❌ Test failed:', error.message);
    }
  });

  const [keyTestResult, setKeyTestResult] = React.useState<{ status: 'idle' | 'testing' | 'success' | 'error', message?: string }>({ status: 'idle' });

  const testAPIKeyDirectly = async () => {
    if (!trimmedKey) return;

    setKeyTestResult({ status: 'testing' });

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${trimmedKey}`,
        }
      });

      if (response.ok) {
        setKeyTestResult({ status: 'success', message: '✅ API key is valid and working!' });
      } else {
        const errorData = await response.json();
        setKeyTestResult({
          status: 'error',
          message: `❌ API key error: ${errorData.error?.message || 'Invalid key'}`
        });
      }
    } catch (error) {
      setKeyTestResult({
        status: 'error',
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  };

  const runTest = () => {
    generateTest.mutate({
      prompt: 'Bạn gặp bạn cũ ở quán cà phê',
      deckName: 'Test',
      modelName: 'Basic',
      tags: ['debug']
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        🔍 API Key Debug Info
      </Typography>

      <Alert severity={hasKey && isValidFormat ? 'success' : 'error'} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>localStorage key:</strong> {hasKey ? '✅ Found' : '❌ Missing'}
        </Typography>
        <Typography variant="body2">
          <strong>Key format:</strong> {isValidFormat ? '✅ Valid' : '❌ Invalid'}
        </Typography>
        <Typography variant="body2">
          <strong>Key type:</strong> {isNewFormat ? '✅ New format (sk-proj-)' : isOldFormat ? '⚠️ Old format (sk-)' : '❌ Unknown'}
        </Typography>
        <Typography variant="body2">
          <strong>Key length:</strong> {trimmedKey.length} chars ✅
        </Typography>
        {hasSpaces && (
          <Typography variant="body2" color="warning.main">
            ⚠️ <strong>Warning:</strong> Key has extra spaces (auto-trimmed)
          </Typography>
        )}
        {trimmedKey && (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75em' }}>
            <strong>Key preview:</strong> {trimmedKey.substring(0, 15)}...{trimmedKey.slice(-6)}
          </Typography>
        )}
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Current Config:</strong> {currentConfig.icon} {currentConfig.name}
        </Typography>
        <Typography variant="body2">
          <strong>Card Type:</strong> {currentConfig.cardType}
        </Typography>
      </Alert>

      {/* API Key Test Result */}
      {keyTestResult.status !== 'idle' && (
        <Alert
          severity={keyTestResult.status === 'success' ? 'success' : keyTestResult.status === 'error' ? 'error' : 'info'}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            {keyTestResult.message || (keyTestResult.status === 'testing' ? '🔄 Testing API key...' : '')}
          </Typography>
        </Alert>
      )}

      <Box display="flex" gap={2} flexWrap="wrap">
        <Button
          variant="outlined"
          onClick={testAPIKeyDirectly}
          disabled={!hasKey || keyTestResult.status === 'testing'}
          color="secondary"
        >
          {keyTestResult.status === 'testing' ? 'Testing Key...' : 'Test API Key'}
        </Button>

        <Button
          variant="contained"
          onClick={runTest}
          disabled={!hasKey || !isValidFormat || generateTest.isLoading}
        >
          {generateTest.isLoading ? 'Testing Full Flow...' : 'Test Full Generation'}
        </Button>

        <Button
          variant="outlined"
          onClick={() => window.location.href = '/settings'}
        >
          Go to Settings
        </Button>

        {hasKey && (
          <Button
            variant="outlined"
            color="warning"
            onClick={() => {
              localStorage.removeItem('openAIKey');
              window.location.reload();
            }}
          >
            Clear Key
          </Button>
        )}
      </Box>      {generateTest.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Error:</strong> {generateTest.error.message}
          </Typography>
        </Alert>
      )}

      {generateTest.data && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Success!</strong> Generated {generateTest.data.length} card(s)
          </Typography>
        </Alert>
      )}
    </Box>
  );
};
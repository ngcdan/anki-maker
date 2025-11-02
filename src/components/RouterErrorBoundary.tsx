import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Home, Refresh } from '@mui/icons-material';

export function RouterErrorBoundary() {
  const error = useRouteError();

  let errorMessage: string;
  let errorStatus: string | number = 'Unknown';

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Có lỗi không xác định xảy ra';
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
      }}
    >
      <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
        <Typography variant="h5" gutterBottom>
          Oops! Có lỗi xảy ra ({errorStatus})
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {errorMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng thử lại hoặc quay về trang chủ.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
        >
          Tải lại trang
        </Button>
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={() => window.location.href = '/'}
        >
          Về trang chủ
        </Button>
      </Box>

      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            mt: 4,
            p: 2,
            backgroundColor: 'grey.100',
            borderRadius: 1,
            maxWidth: 800,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            textAlign: 'left',
            overflow: 'auto',
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Debug Info:
          </Typography>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}
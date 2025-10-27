import React, { Component, ReactNode } from 'react';
import { Alert, Button, Typography, Box } from '@mui/material';
import { ERROR_MESSAGES } from '../../constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <Box sx={{ padding: 4, maxWidth: 600, margin: 'auto' }}>
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              Oops! Có lỗi xảy ra
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              {ERROR_MESSAGES.UNKNOWN} Ứng dụng đã gặp phải một lỗi không mong muốn.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ marginTop: 2, padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  <strong>Error:</strong> {this.state.error.message}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: 1 }}>
                    <strong>Stack:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ marginTop: 2 }}>
              <Button variant="contained" color="primary" onClick={this.handleReset}>
                Thử lại
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ marginLeft: 1 }}
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>
            </Box>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
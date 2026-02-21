import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Container, Box, Typography } from '@mui/material';
import OpenAIKeyContextProvider from './contexts/OpenAIKeyContext';
import { createQueryClient } from './shared';
import AppModern from './pages/Generator';

// Inline ErrorBoundary — replaces deleted components/layout module
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Something went wrong</Typography>
          <Typography color="text.secondary">{this.state.error?.message}</Typography>
        </Container>
      );
    }
    return this.props.children;
  }
}

function Root() {
  return (
    <ErrorBoundary>
      <OpenAIKeyContextProvider>
        <Box sx={{ p: 1, height: '100vh' }}>
          <AppModern />
        </Box>
      </OpenAIKeyContextProvider>
    </ErrorBoundary>
  );
}

// Create optimized query client
const queryClient = createQueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </React.StrictMode>
);

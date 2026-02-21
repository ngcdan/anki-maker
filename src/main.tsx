import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
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

function Navigation() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          color="inherit"
          sx={{
            textDecoration: 'none',
            fontWeight: 700,
            flexGrow: 1,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Anki Card Creator
        </Typography>

      </Toolbar>
    </AppBar>
  );
}

function Root() {
  return (
    <ErrorBoundary>
      <OpenAIKeyContextProvider>
        <Navigation />
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
          <AppModern />
        </Container>
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

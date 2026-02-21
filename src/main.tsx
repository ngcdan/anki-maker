import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Link, Outlet, useRouteError } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import OpenAIKeyContextProvider from './contexts/OpenAIKeyContext';
import { createQueryClient } from './shared';
import Home from './pages/Home';
import Settings from './pages/Settings';
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

function RouterErrorBoundary() {
  const error = useRouteError() as Error;
  return (
    <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Page Error</Typography>
      <Typography color="text.secondary">{error?.message || 'Unknown error'}</Typography>
    </Container>
  );
}

function Navigation() {
  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            component={Link}
            to="/settings"
            color="inherit"
            sx={{
              textDecoration: 'none',
              fontWeight: 500,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            Settings
          </Typography>
        </Box>
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
          <Outlet />
        </Container>
      </OpenAIKeyContextProvider>
    </ErrorBoundary>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "suggest",
        element: <AppModern />,
      },
      {
        path: "app",
        element: <AppModern />,
      },
    ],
  },
]);

// Create optimized query client
const queryClient = createQueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

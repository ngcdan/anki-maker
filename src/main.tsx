import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Link } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Container, IconButton, Box, CircularProgress } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import OpenAIKeyContextProvider from './contexts/OpenAIKeyContext';
import { ErrorBoundary, ToastProvider } from './components/layout';
import { RouterOutlet } from './components/RouterOutlet';
import { RouterErrorBoundary } from './components/RouterErrorBoundary';
import { createQueryClient } from './shared';
import { ThemeProvider, useAppTheme } from './theme';
import {
  LazyHomeWithChunk as Home,
  LazySettingsWithChunk as Settings,
  LazyAppWithChunk as AppModern
} from './components/ui/LazyLoader';

function Navigation() {
  const { mode, toggleMode } = useAppTheme();

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

          <IconButton
            onClick={toggleMode}
            color="inherit"
            sx={{
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)',
              },
            }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

// Loading component for Suspense fallback
function PageLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Đang tải...
      </Typography>
    </Box>
  );
}

function Root() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OpenAIKeyContextProvider>
          <Navigation />
          <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
            <Suspense fallback={<PageLoading />}>
              <RouterOutlet />
            </Suspense>
          </Container>
        </OpenAIKeyContextProvider>
      </ToastProvider>
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
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);

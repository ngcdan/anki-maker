import React, { Suspense, startTransition } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, Link } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Container, IconButton, Box, CircularProgress } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import OpenAIKeyContextProvider from './OpenAIKeyContext';
import { ErrorBoundary, ToastProvider } from './components/layout';
import { RouterOutlet } from './components/RouterOutlet';
import { RouterErrorBoundary } from './components/RouterErrorBoundary';
import { createQueryClient } from './config/queryClient';
import { ThemeProvider, useAppTheme } from './theme';
import {
  LazyHomeWithChunk as Home,
  LazySettingsWithChunk as Settings
} from './components/LazyLoader';

// Create lazy loading for app components
const AppModern = React.lazy(() => import('./pages/app/AppModern'));
const AppSimple = React.lazy(() => import('./pages/app/AppSimple'));
const App = React.lazy(() => import('./pages/app/App'));
const TestAnkiFormat = React.lazy(() => import('./pages/TestAnkiFormat'));
const CompareNotecards = React.lazy(() => import('./pages/CompareNotecards'));

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
        element: <App />,
      },
      {
        path: "simple",
        element: <AppSimple />,
      },
      {
        path: "test",
        element: <TestAnkiFormat />,
      },
      {
        path: "compare",
        element: <CompareNotecards />,
      },
    ],
  },
]);

// Create optimized query client
const queryClient = createQueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);

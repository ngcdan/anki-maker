import React from 'react'
import ReactDOM from 'react-dom/client'
import { Outlet, RouterProvider, createBrowserRouter, Link } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import OpenAIKeyContextProvider from './OpenAIKeyContext';
import { ErrorBoundary, ToastProvider } from './components';
import { createQueryClient } from './config/queryClient';
import {
  LazyHomeWithChunk as Home,
  LazyAppWithChunk as App,
  LazySettingsWithChunk as Settings
} from './components/LazyLoader';

function Root() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <OpenAIKeyContextProvider>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component={Link} to="/" color="inherit" sx={{ textDecoration: 'none' }}>anki card creator</Typography>
              <Typography sx={{ marginLeft: 4, textDecoration: 'none' }} component={Link} to="/settings" color="inherit">Settings</Typography>
            </Toolbar>
          </AppBar>
          <Container>
            <Outlet />
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
        element: <App />,
      },
    ],
  },
]);

// Create optimized query client
const queryClient = createQueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

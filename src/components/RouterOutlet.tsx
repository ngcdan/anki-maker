import { Suspense, startTransition } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

// Loading component for route transitions
function RouteLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40vh',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        Đang chuyển trang...
      </Typography>
    </Box>
  );
}

// Router outlet wrapper with proper Suspense handling
export function RouterOutlet() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Outlet />
    </Suspense>
  );
}

// Hook to navigate with transition
export function useTransitionNavigate() {
  const navigate = useNavigate();

  return (to: string, options?: { replace?: boolean }) => {
    startTransition(() => {
      navigate(to, options);
    });
  };
}

export default RouterOutlet;
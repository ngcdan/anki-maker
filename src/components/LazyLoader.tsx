import { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Lazy loading component wrapper with error boundary
const LazyWrapper = ({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const defaultFallback = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Đang tải...
      </Typography>
    </Box>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Lazy loaded components
export const LazyApp = lazy(() => import('../pages/app/App'));
export const LazySettings = lazy(() => import('../pages/Settings'));

// Optimized imports with chunk names
const LazyAppWithChunk = lazy(() =>
  import(/* webpackChunkName: "app" */ '../pages/app/App')
);

const LazySettingsWithChunk = lazy(() =>
  import(/* webpackChunkName: "settings" */ '../pages/Settings')
);

// Removed unused lazy components

// Higher-order component for lazy loading with custom error handling
export const withLazyLoading = <T extends object>(
  Component: React.ComponentType<T>,
  loadingComponent?: React.ReactNode,
  _errorComponent?: React.ReactNode // Keep for future use
) => {
  return (props: T) => (
    <LazyWrapper fallback={loadingComponent}>
      <Component {...props} />
    </LazyWrapper>
  );
};

// Preload function for critical routes
export const preloadComponent = (componentImporter: () => Promise<any>) => {
  return componentImporter();
};

// Route-based lazy loading configuration
export const routeComponents = {
  app: {
    component: LazyAppWithChunk,
    preload: () => import(/* webpackChunkName: "app" */ '../pages/app/App'),
  },
  settings: {
    component: LazySettingsWithChunk,
    preload: () => import(/* webpackChunkName: "settings" */ '../pages/Settings'),
  },
};

export default LazyWrapper;
export { LazySettingsWithChunk, LazyAppWithChunk };
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
export const LazyApp = lazy(() => import('../App'));
export const LazySettings = lazy(() => import('../Settings'));
export const LazyHome = lazy(() => import('../Home'));
export const LazyPerformanceDemo = lazy(() => import('./PerformanceDemo'));

// Optimized imports with chunk names
export const LazyAppWithChunk = lazy(() =>
  import(/* webpackChunkName: "app" */ '../App')
);

export const LazySettingsWithChunk = lazy(() =>
  import(/* webpackChunkName: "settings" */ '../Settings')
);

export const LazyHomeWithChunk = lazy(() =>
  import(/* webpackChunkName: "home" */ '../Home')
);

export const LazyPerformanceDemoWithChunk = lazy(() =>
  import(/* webpackChunkName: "performance-demo" */ './PerformanceDemo')
);

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
  home: {
    component: LazyHomeWithChunk,
    preload: () => import(/* webpackChunkName: "home" */ '../Home'),
  },
  app: {
    component: LazyAppWithChunk,
    preload: () => import(/* webpackChunkName: "app" */ '../App'),
  },
  settings: {
    component: LazySettingsWithChunk,
    preload: () => import(/* webpackChunkName: "settings" */ '../Settings'),
  },
  performanceDemo: {
    component: LazyPerformanceDemoWithChunk,
    preload: () => import(/* webpackChunkName: "performance-demo" */ './PerformanceDemo'),
  },
};

export default LazyWrapper;
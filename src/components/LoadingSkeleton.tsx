import { memo, useMemo, ReactNode } from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Fade,
} from '@mui/material';

interface LoadingSkeletonProps {
  type: 'card' | 'form' | 'list' | 'table' | 'text';
  count?: number;
  height?: number;
  width?: string;
  animation?: 'pulse' | 'wave' | false;
  children?: ReactNode;
}

const LoadingSkeleton = memo<LoadingSkeletonProps>(({
  type,
  count = 1,
  height = 56,
  width = '100%',
  animation = 'wave',
  children,
}) => {
  const skeletonContent = useMemo(() => {
    const items = Array.from({ length: count }, (_, index) => {
      switch (type) {
        case 'card':
          return (
            <Card key={index} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} animation={animation} />
                <Skeleton variant="rectangular" height={60} sx={{ mt: 1 }} animation={animation} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} animation={animation} />
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Skeleton variant="rectangular" width={80} height={32} animation={animation} />
                  <Skeleton variant="rectangular" width={60} height={32} animation={animation} />
                </Box>
              </CardContent>
            </Card>
          );

        case 'form':
          return (
            <Box key={index}>
              <Skeleton variant="text" width="30%" height={24} animation={animation} />
              <Skeleton variant="rectangular" height={height} sx={{ mt: 1, mb: 2 }} animation={animation} />
            </Box>
          );

        case 'list':
          return (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Skeleton variant="circular" width={40} height={40} animation={animation} />
              <Box sx={{ ml: 2, flex: 1 }}>
                <Skeleton variant="text" width="60%" animation={animation} />
                <Skeleton variant="text" width="40%" animation={animation} />
              </Box>
            </Box>
          );

        case 'table':
          return (
            <Box key={index} sx={{ display: 'flex', mb: 1 }}>
              <Skeleton variant="rectangular" width="25%" height={height} sx={{ mr: 1 }} animation={animation} />
              <Skeleton variant="rectangular" width="50%" height={height} sx={{ mr: 1 }} animation={animation} />
              <Skeleton variant="rectangular" width="25%" height={height} animation={animation} />
            </Box>
          );

        case 'text':
        default:
          return (
            <Skeleton
              key={index}
              variant="rectangular"
              width={width}
              height={height}
              sx={{ mb: 1 }}
              animation={animation}
            />
          );
      }
    });

    return items;
  }, [type, count, height, width, animation]);

  return (
    <Fade in timeout={300}>
      <Box>
        {skeletonContent}
        {children}
      </Box>
    </Fade>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Pre-defined skeleton configurations for common use cases
export const CardListSkeleton = memo(() => (
  <LoadingSkeleton type="card" count={3} />
));

export const FormSkeleton = memo(() => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} />
    <LoadingSkeleton type="form" count={4} />
    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
      <Skeleton variant="rectangular" width={100} height={36} />
      <Skeleton variant="rectangular" width={80} height={36} />
    </Box>
  </Box>
));

export const TextSkeleton = memo<{ lines?: number }>(({ lines = 3 }) => (
  <Box>
    {Array.from({ length: lines }, (_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
        height={24}
        sx={{ mb: 0.5 }}
      />
    ))}
  </Box>
));

export default LoadingSkeleton;
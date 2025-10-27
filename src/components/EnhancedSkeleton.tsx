import { memo } from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Fade,
  useTheme,
} from '@mui/material';

interface EnhancedSkeletonProps {
  variant?: 'card' | 'form' | 'list' | 'stats';
  count?: number;
  animated?: boolean;
}

const EnhancedSkeleton = memo<EnhancedSkeletonProps>(({
  variant = 'card',
  count = 1,
  animated = true,
}) => {
  const theme = useTheme();

  const renderCardSkeleton = () => (
    <Card
      sx={{
        borderRadius: 4,
        border: `2px solid ${theme.palette.divider}`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, transparent)`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="circular" width={24} height={24} animation={animated ? 'wave' : false} />
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} animation={animated ? 'wave' : false} />
          </Box>
          <Skeleton variant="rectangular" width={120} height={16} animation={animated ? 'wave' : false} />
        </Box>

        {/* Content */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Skeleton variant="circular" width={16} height={16} animation={animated ? 'wave' : false} />
            <Skeleton variant="text" width={100} height={20} animation={animated ? 'wave' : false} />
          </Box>
          <Skeleton
            variant="rectangular"
            height={60}
            sx={{ borderRadius: 2, mb: 2 }}
            animation={animated ? 'wave' : false}
          />
        </Box>

        {/* Expanded content placeholder */}
        <Box sx={{ mb: 2 }}>
          <Skeleton variant="text" width="60%" height={16} animation={animated ? 'wave' : false} />
          <Skeleton variant="text" width="80%" height={16} animation={animated ? 'wave' : false} />
          <Skeleton variant="text" width="40%" height={16} animation={animated ? 'wave' : false} />
        </Box>

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={60}
              height={24}
              sx={{ borderRadius: 1 }}
              animation={animated ? 'wave' : false}
            />
          ))}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Skeleton
            variant="rectangular"
            width={100}
            height={36}
            sx={{ borderRadius: 2 }}
            animation={animated ? 'wave' : false}
          />
          <Skeleton
            variant="rectangular"
            width={40}
            height={36}
            sx={{ borderRadius: 2 }}
            animation={animated ? 'wave' : false}
          />
        </Box>
      </CardContent>
    </Card>
  );

  const renderFormSkeleton = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={24} height={24} animation={animated ? 'wave' : false} />
        <Skeleton variant="text" width={120} height={24} animation={animated ? 'wave' : false} />
      </Box>

      {/* Form fields */}
      {[1, 2, 3].map((i) => (
        <Box key={i}>
          <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} animation={animated ? 'wave' : false} />
          <Skeleton
            variant="rectangular"
            height={56}
            sx={{ borderRadius: 2 }}
            animation={animated ? 'wave' : false}
          />
        </Box>
      ))}

      {/* Submit button */}
      <Skeleton
        variant="rectangular"
        width={140}
        height={40}
        sx={{ borderRadius: 2, alignSelf: 'flex-end' }}
        animation={animated ? 'wave' : false}
      />
    </Box>
  );

  const renderStatsSkeleton = () => (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Skeleton variant="text" width={60} height={32} sx={{ mb: 0.5 }} animation={animated ? 'wave' : false} />
          <Skeleton variant="text" width={80} height={16} animation={animated ? 'wave' : false} />
        </Box>
        <Skeleton variant="circular" width={32} height={32} animation={animated ? 'wave' : false} />
      </Box>
    </Box>
  );

  const renderListSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="circular" width={40} height={40} animation={animated ? 'wave' : false} />
      <Box sx={{ ml: 2, flex: 1 }}>
        <Skeleton variant="text" width="60%" animation={animated ? 'wave' : false} />
        <Skeleton variant="text" width="40%" animation={animated ? 'wave' : false} />
      </Box>
    </Box>
  );

  const renderContent = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'stats':
        return renderStatsSkeleton();
      case 'list':
        return renderListSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  const items = Array.from({ length: count }, (_, index) => (
    <Fade key={index} in timeout={300 + index * 100}>
      <Box sx={{ mb: variant === 'stats' ? 0 : 2 }}>
        {renderContent()}
      </Box>
    </Fade>
  ));

  return <>{items}</>;
});

EnhancedSkeleton.displayName = 'EnhancedSkeleton';

export default EnhancedSkeleton;
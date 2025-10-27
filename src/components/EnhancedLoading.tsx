import { memo, ReactNode } from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  useTheme,
  keyframes,
  alpha,
} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  Psychology as BrainIcon,
  School as LearnIcon,
} from '@mui/icons-material';

const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

interface EnhancedLoadingProps {
  variant?: 'circular' | 'linear' | 'card' | 'fullscreen' | 'inline' | 'custom';
  size?: 'small' | 'medium' | 'large';
  message?: string;
  submessage?: string;
  progress?: number;
  children?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  animated?: boolean;
  overlay?: boolean;
}

const EnhancedLoading = memo<EnhancedLoadingProps>(({
  variant = 'circular',
  size = 'medium',
  message = 'Đang xử lý...',
  submessage,
  progress,
  children,
  color = 'primary',
  animated = true,
  overlay = false,
}) => {
  const theme = useTheme();

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return { width: 24, height: 24, fontSize: '0.875rem' };
      case 'medium':
        return { width: 40, height: 40, fontSize: '1rem' };
      case 'large':
        return { width: 60, height: 60, fontSize: '1.125rem' };
      default:
        return { width: 40, height: 40, fontSize: '1rem' };
    }
  };

  const getLoadingIcon = () => {
    const icons = [SparkleIcon, BrainIcon, LearnIcon];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    return <IconComponent />;
  };

  const sizeValues = getSizeValue();

  const renderCircularLoading = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 4,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress
          size={sizeValues.width}
          thickness={3}
          color={color}
          sx={{
            animation: animated ? `${spinAnimation} 1s linear infinite` : 'none',
          }}
        />
        {animated && (
          <Box
            sx={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette[color].main,
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          >
            {getLoadingIcon()}
          </Box>
        )}
      </Box>

      {message && (
        <Typography
          variant="body1"
          sx={{
            fontSize: sizeValues.fontSize,
            fontWeight: 500,
            textAlign: 'center',
            animation: animated ? `${pulseAnimation} 2s ease-in-out infinite` : 'none',
          }}
        >
          {message}
        </Typography>
      )}

      {submessage && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: `calc(${sizeValues.fontSize} - 0.125rem)`,
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          {submessage}
        </Typography>
      )}
    </Box>
  );

  const renderLinearLoading = () => (
    <Box sx={{ width: '100%', mb: 2 }}>
      {message && (
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          {message}
        </Typography>
      )}

      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant={progress !== undefined ? 'determinate' : 'indeterminate'}
          value={progress}
          color={color}
          sx={{
            height: 6,
            borderRadius: 3,
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              background: `linear-gradient(90deg,
                ${theme.palette[color].main},
                ${theme.palette[color].light})`,
            },
          }}
        />

        {progress !== undefined && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: theme.palette[color].main,
            }}
          >
            {Math.round(progress)}%
          </Typography>
        )}
      </Box>

      {submessage && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5 }}
        >
          {submessage}
        </Typography>
      )}
    </Box>
  );

  const renderCardLoading = () => (
    <Card
      sx={{
        borderRadius: 4,
        border: `2px solid ${alpha(theme.palette[color].main, 0.2)}`,
        background: `linear-gradient(135deg,
          ${alpha(theme.palette[color].main, 0.05)} 0%,
          ${alpha(theme.palette[color].light, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg,
            transparent,
            ${alpha(theme.palette[color].main, 0.1)},
            transparent)`,
          animation: animated ? `${shimmerAnimation} 2s infinite` : 'none',
        },
      }}
    >
      <CardContent sx={{ py: 4 }}>
        {renderCircularLoading()}
      </CardContent>
    </Card>
  );

  const renderFullscreenLoading = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: alpha(theme.palette.background.default, 0.9),
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.modal + 1,
      }}
    >
      <Card
        sx={{
          borderRadius: 4,
          minWidth: 300,
          boxShadow: theme.shadows[16],
          animation: animated ? `${floatAnimation} 3s ease-in-out infinite` : 'none',
        }}
      >
        <CardContent sx={{ py: 4 }}>
          {renderCircularLoading()}
        </CardContent>
      </Card>
    </Box>
  );

  const renderInlineLoading = () => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        py: 0.5,
      }}
    >
      <CircularProgress
        size={16}
        thickness={4}
        color={color}
      />
      {message && (
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.875rem',
            animation: animated ? `${pulseAnimation} 2s ease-in-out infinite` : 'none',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderCustomLoading = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        position: 'relative',
      }}
    >
      {children || renderCircularLoading()}
    </Box>
  );

  const getLoadingContent = () => {
    switch (variant) {
      case 'circular':
        return renderCircularLoading();
      case 'linear':
        return renderLinearLoading();
      case 'card':
        return renderCardLoading();
      case 'fullscreen':
        return renderFullscreenLoading();
      case 'inline':
        return renderInlineLoading();
      case 'custom':
        return renderCustomLoading();
      default:
        return renderCircularLoading();
    }
  };

  if (overlay && variant !== 'fullscreen') {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          borderRadius: 'inherit',
        }}
      >
        {getLoadingContent()}
      </Box>
    );
  }

  return getLoadingContent();
});

EnhancedLoading.displayName = 'EnhancedLoading';

export default EnhancedLoading;
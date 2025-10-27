import { memo } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  Cancel as ErrorIcon,
} from '@mui/icons-material';

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const progressAnimation = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

interface ProgressStep {
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description?: string;
}

interface EnhancedProgressProps {
  variant?: 'linear' | 'circular' | 'stepper' | 'custom';
  value?: number;
  steps?: ProgressStep[];
  title?: string;
  subtitle?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  animated?: boolean;
  showPercentage?: boolean;
  height?: number;
}

const EnhancedProgress = memo<EnhancedProgressProps>(({
  variant = 'linear',
  value = 0,
  steps = [],
  title,
  subtitle,
  color = 'primary',
  animated = true,
  showPercentage = true,
  height = 8,
}) => {
  const theme = useTheme();

  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckIcon sx={{ color: theme.palette.success.main, fontSize: '1.5rem' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: theme.palette.error.main, fontSize: '1.5rem' }} />;
      case 'active':
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: `3px solid ${theme.palette[color].main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.background.paper,
              animation: animated ? `${pulseAnimation} 1.5s ease-in-out infinite` : 'none',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: theme.palette[color].main,
              }}
            />
          </Box>
        );
      case 'pending':
      default:
        return (
          <PendingIcon
            sx={{
              color: theme.palette.text.disabled,
              fontSize: '1.5rem'
            }}
          />
        );
    }
  };

  const renderLinearProgress = () => (
    <Box sx={{ width: '100%' }}>
      {(title || subtitle) && (
        <Box sx={{ mb: 2 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ position: 'relative', mb: 1 }}>
        <Box
          sx={{
            width: '100%',
            height,
            borderRadius: height / 2,
            backgroundColor: alpha(theme.palette[color].main, 0.1),
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, value))}%`,
              background: `linear-gradient(90deg,
                ${theme.palette[color].main},
                ${theme.palette[color].light})`,
              borderRadius: height / 2,
              transition: animated ? 'width 0.5s ease-in-out' : 'none',
              animation: animated ? `${progressAnimation} 1s ease-out` : 'none',
              position: 'relative',
              '&::after': animated ? {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg,
                  transparent,
                  rgba(255, 255, 255, 0.3),
                  transparent)`,
                transform: 'translateX(-100%)',
                animation: `${progressAnimation} 2s ease-in-out infinite`,
              } : {},
            }}
          />
        </Box>

        {showPercentage && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              fontWeight: 600,
              color: theme.palette[color].main,
              fontSize: '0.875rem',
              mt: -0.5,
            }}
          >
            {Math.round(value)}%
          </Typography>
        )}
      </Box>
    </Box>
  );

  const renderStepperProgress = () => (
    <Box sx={{ width: '100%' }}>
      {(title || subtitle) && (
        <Box sx={{ mb: 3 }}>
          {title && (
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      <Stepper
        orientation="vertical"
        sx={{
          '& .MuiStepConnector-root': {
            marginLeft: '12px',
            '& .MuiStepConnector-line': {
              borderLeftWidth: 2,
              borderColor: alpha(theme.palette.divider, 0.5),
            },
          },
        }}
      >
        {steps.map((step, index) => (
          <Step key={index} active={step.status === 'active'} completed={step.status === 'completed'}>
            <StepLabel
              StepIconComponent={() => getStepIcon(step.status)}
              sx={{
                '& .MuiStepLabel-label': {
                  fontWeight: step.status === 'active' ? 600 : 400,
                  color: step.status === 'error'
                    ? theme.palette.error.main
                    : step.status === 'completed'
                      ? theme.palette.success.main
                      : step.status === 'active'
                        ? theme.palette[color].main
                        : theme.palette.text.secondary,
                  fontSize: '1rem',
                },
              }}
            >
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: step.status === 'active' ? 600 : 500,
                    color: 'inherit',
                  }}
                >
                  {step.label}
                </Typography>
                {step.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      mt: 0.5,
                    }}
                  >
                    {step.description}
                  </Typography>
                )}
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );

  const renderCustomProgress = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg,
          ${alpha(theme.palette[color].main, 0.05)} 0%,
          ${alpha(theme.palette[color].light, 0.1)} 100%)`,
        border: `1px solid ${alpha(theme.palette[color].main, 0.2)}`,
      }}
    >
      <Box sx={{ flex: 1 }}>
        {title && (
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        {renderLinearProgress()}
      </Box>

      {showPercentage && (
        <Box
          sx={{
            minWidth: 60,
            textAlign: 'center',
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette[color].main, 0.1),
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: theme.palette[color].main,
            }}
          >
            {Math.round(value)}%
          </Typography>
        </Box>
      )}
    </Box>
  );

  switch (variant) {
    case 'linear':
      return renderLinearProgress();
    case 'stepper':
      return renderStepperProgress();
    case 'custom':
      return renderCustomProgress();
    default:
      return renderLinearProgress();
  }
});

EnhancedProgress.displayName = 'EnhancedProgress';

export default EnhancedProgress;
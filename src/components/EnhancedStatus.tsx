import { memo, useState } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Typography,
  Fade,
  useTheme,
  alpha,
  keyframes,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as PendingIcon,
  Sync as LoadingIcon,
  HelpOutline as UnknownIcon,
} from '@mui/icons-material';

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulseAnimation = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const bounceAnimation = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-8px); }
  70% { transform: translateY(-4px); }
  90% { transform: translateY(-2px); }
`;

export type StatusType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'pending'
  | 'loading'
  | 'unknown';

interface StatusConfig {
  icon: React.ReactNode;
  color: string;
  backgroundColor: string;
  borderColor: string;
  animation?: string;
}

interface EnhancedStatusProps {
  status: StatusType;
  label?: string;
  description?: string;
  variant?: 'chip' | 'badge' | 'indicator' | 'card';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  tooltip?: string;
  count?: number;
  showIcon?: boolean;
  customColor?: string;
}

const EnhancedStatus = memo<EnhancedStatusProps>(({
  status,
  label,
  description,
  variant = 'chip',
  size = 'medium',
  animated = true,
  clickable = false,
  onClick,
  tooltip,
  count,
  showIcon = true,
  customColor,
}) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const getStatusConfig = (): StatusConfig => {
    const configs: Record<StatusType, StatusConfig> = {
      success: {
        icon: <SuccessIcon />,
        color: customColor || theme.palette.success.main,
        backgroundColor: alpha(customColor || theme.palette.success.main, 0.1),
        borderColor: alpha(customColor || theme.palette.success.main, 0.3),
        animation: animated ? bounceAnimation : undefined,
      },
      error: {
        icon: <ErrorIcon />,
        color: customColor || theme.palette.error.main,
        backgroundColor: alpha(customColor || theme.palette.error.main, 0.1),
        borderColor: alpha(customColor || theme.palette.error.main, 0.3),
        animation: animated ? pulseAnimation : undefined,
      },
      warning: {
        icon: <WarningIcon />,
        color: customColor || theme.palette.warning.main,
        backgroundColor: alpha(customColor || theme.palette.warning.main, 0.1),
        borderColor: alpha(customColor || theme.palette.warning.main, 0.3),
        animation: animated ? pulseAnimation : undefined,
      },
      info: {
        icon: <InfoIcon />,
        color: customColor || theme.palette.info.main,
        backgroundColor: alpha(customColor || theme.palette.info.main, 0.1),
        borderColor: alpha(customColor || theme.palette.info.main, 0.3),
      },
      pending: {
        icon: <PendingIcon />,
        color: customColor || theme.palette.grey[600],
        backgroundColor: alpha(customColor || theme.palette.grey[600], 0.1),
        borderColor: alpha(customColor || theme.palette.grey[600], 0.3),
        animation: animated ? pulseAnimation : undefined,
      },
      loading: {
        icon: <LoadingIcon />,
        color: customColor || theme.palette.primary.main,
        backgroundColor: alpha(customColor || theme.palette.primary.main, 0.1),
        borderColor: alpha(customColor || theme.palette.primary.main, 0.3),
        animation: animated ? rotateAnimation : undefined,
      },
      unknown: {
        icon: <UnknownIcon />,
        color: customColor || theme.palette.grey[500],
        backgroundColor: alpha(customColor || theme.palette.grey[500], 0.1),
        borderColor: alpha(customColor || theme.palette.grey[500], 0.3),
      },
    };

    return configs[status];
  };

  const getSizeValues = () => {
    switch (size) {
      case 'small':
        return {
          height: 24,
          fontSize: '0.75rem',
          iconSize: '0.875rem',
          padding: '0 8px',
          gap: 4,
        };
      case 'large':
        return {
          height: 40,
          fontSize: '1rem',
          iconSize: '1.25rem',
          padding: '0 16px',
          gap: 8,
        };
      default: // medium
        return {
          height: 32,
          fontSize: '0.875rem',
          iconSize: '1rem',
          padding: '0 12px',
          gap: 6,
        };
    }
  };

  const config = getStatusConfig();
  const sizeValues = getSizeValues();

  const baseStyles = {
    height: sizeValues.height,
    borderRadius: sizeValues.height / 2,
    fontSize: sizeValues.fontSize,
    fontWeight: 500,
    border: `1px solid ${config.borderColor}`,
    backgroundColor: config.backgroundColor,
    color: config.color,
    cursor: clickable ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    ...(hovered && clickable && {
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px ${alpha(config.color, 0.3)}`,
      backgroundColor: alpha(config.color, 0.15),
    }),
  };

  const iconStyles = {
    fontSize: sizeValues.iconSize,
    animation: config.animation ? `${config.animation} ${status === 'loading' ? '1s' : '2s'
      } ${status === 'loading' ? 'linear' : 'ease-in-out'} infinite` : 'none',
  };

  const renderChip = () => (
    <Chip
      icon={showIcon ? <Box sx={iconStyles}>{config.icon}</Box> : undefined}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: sizeValues.gap / 8 }}>
          {label}
          {count !== undefined && (
            <Box
              sx={{
                ml: 0.5,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: alpha(config.color, 0.2),
                fontSize: '0.75rem',
                fontWeight: 600,
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {count}
            </Box>
          )}
        </Box>
      }
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={baseStyles}
    />
  );

  const renderBadge = () => (
    <Box
      sx={{
        ...baseStyles,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: sizeValues.padding,
        gap: sizeValues.gap / 8,
        position: 'relative',
      }}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {showIcon && <Box sx={iconStyles}>{config.icon}</Box>}
      {label && <Typography variant="body2" sx={{ fontSize: sizeValues.fontSize }}>{label}</Typography>}
      {count !== undefined && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            minWidth: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: config.color,
            color: theme.palette.getContrastText(config.color),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            boxShadow: `0 2px 4px ${alpha(config.color, 0.3)}`,
          }}
        >
          {count > 99 ? '99+' : count}
        </Box>
      )}
    </Box>
  );

  const renderIndicator = () => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        cursor: clickable ? 'pointer' : 'default',
      }}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box
        sx={{
          width: sizeValues.height / 2,
          height: sizeValues.height / 2,
          borderRadius: '50%',
          backgroundColor: config.color,
          ...iconStyles,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: sizeValues.iconSize,
          color: theme.palette.getContrastText(config.color),
        }}
      >
        {showIcon ? config.icon : null}
      </Box>
      {label && (
        <Typography
          variant="body2"
          sx={{
            fontSize: sizeValues.fontSize,
            color: hovered && clickable ? config.color : 'text.primary',
            transition: 'color 0.2s ease-in-out',
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );

  const renderCard = () => (
    <Box
      sx={{
        ...baseStyles,
        height: 'auto',
        borderRadius: 3,
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 120,
      }}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {showIcon && <Box sx={iconStyles}>{config.icon}</Box>}
        {label && (
          <Typography variant="h6" sx={{ fontSize: sizeValues.fontSize, fontWeight: 600 }}>
            {label}
          </Typography>
        )}
        {count !== undefined && (
          <Typography variant="h6" sx={{ fontSize: sizeValues.fontSize, fontWeight: 600 }}>
            ({count})
          </Typography>
        )}
      </Box>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {description}
        </Typography>
      )}
    </Box>
  );

  const renderContent = () => {
    switch (variant) {
      case 'badge':
        return renderBadge();
      case 'indicator':
        return renderIndicator();
      case 'card':
        return renderCard();
      default:
        return renderChip();
    }
  };

  const content = (
    <Fade in timeout={300}>
      <Box sx={{ display: 'inline-block' }}>
        {renderContent()}
      </Box>
    </Fade>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow placement="top">
        {content}
      </Tooltip>
    );
  }

  return content;
});

EnhancedStatus.displayName = 'EnhancedStatus';

export default EnhancedStatus;
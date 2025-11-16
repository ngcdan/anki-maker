import { memo, useState, useEffect } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  IconButton,
  Grow,
  useTheme,
  keyframes,
  alpha,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideInAnimation = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

export interface FeedbackMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface FeedbackSystemProps {
  messages: FeedbackMessage[];
  onDismiss: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  maxVisible?: number;
}

const FeedbackSystem = memo<FeedbackSystemProps>(({
  messages,
  onDismiss,
  position = 'top-right',
  maxVisible = 3,
}) => {
  const theme = useTheme();
  const [visibleMessages, setVisibleMessages] = useState<FeedbackMessage[]>([]);

  useEffect(() => {
    setVisibleMessages(messages.slice(0, maxVisible));
  }, [messages, maxVisible]);

  const getIcon = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'info':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: theme.zIndex.snackbar + 1,
      pointerEvents: 'none' as const,
    };

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: 24, right: 24 };
      case 'top-left':
        return { ...baseStyles, top: 24, left: 24 };
      case 'bottom-right':
        return { ...baseStyles, bottom: 24, right: 24 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 24, left: 24 };
      case 'top-center':
        return { ...baseStyles, top: 24, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-center':
        return { ...baseStyles, bottom: 24, left: '50%', transform: 'translateX(-50%)' };
      default:
        return { ...baseStyles, top: 24, right: 24 };
    }
  };

  const getSeverityColor = (type: FeedbackMessage['type']) => {
    switch (type) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.info.main;
    }
  };

  if (visibleMessages.length === 0) return null;

  return (
    <Box sx={getPositionStyles()}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
          gap: 1,
          maxWidth: 400,
          width: '100%',
        }}
      >
        {visibleMessages.map((message, index) => (
          <Grow
            key={message.id}
            in={true}
            timeout={300 + index * 100}
            style={{ transformOrigin: position.includes('right') ? 'right top' : 'left top' }}
          >
            <Alert
              severity={message.type}
              icon={getIcon(message.type)}
              onClose={message.persistent ? undefined : () => onDismiss(message.id)}
              action={
                message.action ? (
                  <IconButton
                    size="small"
                    onClick={message.action.onClick}
                    sx={{
                      color: getSeverityColor(message.type),
                      '&:hover': {
                        backgroundColor: alpha(getSeverityColor(message.type), 0.1),
                      },
                    }}
                  >
                    {message.action.label}
                  </IconButton>
                ) : undefined
              }
              sx={{
                pointerEvents: 'auto',
                minWidth: 320,
                maxWidth: 400,
                boxShadow: theme.shadows[8],
                borderRadius: 3,
                border: `1px solid ${alpha(getSeverityColor(message.type), 0.2)}`,
                animation: `${slideInAnimation} 0.3s ease-out`,
                '&:hover': {
                  animation: `${pulseAnimation} 0.6s ease-in-out`,
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s ease-in-out',
                },
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
                '& .MuiAlert-message': {
                  flex: 1,
                  overflow: 'hidden',
                },
                '& .MuiAlert-action': {
                  alignItems: 'flex-start',
                  paddingTop: 0,
                },
                backdropFilter: 'blur(10px)',
                background: `linear-gradient(135deg,
                  ${alpha(theme.palette.background.paper, 0.95)} 0%,
                  ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
              }}
            >
              {message.title && (
                <AlertTitle
                  sx={{
                    marginBottom: message.message ? 0.5 : 0,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    lineHeight: 1.3,
                  }}
                >
                  {message.title}
                </AlertTitle>
              )}
              <Box
                sx={{
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  maxHeight: '120px',
                  overflow: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: alpha(getSeverityColor(message.type), 0.3),
                    borderRadius: '2px',
                  },
                }}
              >
                {message.message}
              </Box>
            </Alert>
          </Grow>
        ))}
      </Box>
    </Box>
  );
});

FeedbackSystem.displayName = 'FeedbackSystem';

// Hook for managing feedback messages
export const useFeedback = () => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const addMessage = (message: Omit<FeedbackMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newMessage: FeedbackMessage = {
      ...message,
      id,
      duration: message.duration ?? (message.type === 'error' ? 6000 : 4000),
    };

    setMessages(prev => [newMessage, ...prev]);

    // Auto-dismiss if not persistent
    if (!newMessage.persistent && newMessage.duration && newMessage.duration > 0) {
      setTimeout(() => {
        dismissMessage(id);
      }, newMessage.duration);
    }
  };

  const dismissMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  const clearAll = () => {
    setMessages([]);
  };

  const success = (message: string, options?: Partial<FeedbackMessage>) =>
    addMessage({ type: 'success', message, ...options });

  const error = (message: string, options?: Partial<FeedbackMessage>) =>
    addMessage({ type: 'error', message, ...options });

  const warning = (message: string, options?: Partial<FeedbackMessage>) =>
    addMessage({ type: 'warning', message, ...options });

  const info = (message: string, options?: Partial<FeedbackMessage>) =>
    addMessage({ type: 'info', message, ...options });

  return {
    messages,
    addMessage,
    dismissMessage,
    clearAll,
    success,
    error,
    warning,
    info,
  };
};

export default FeedbackSystem;
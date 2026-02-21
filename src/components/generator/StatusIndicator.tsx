import { Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface StatusIndicatorProps {
  isConnected: boolean;
  hasValidKey: boolean;
}

export function StatusIndicator({ isConnected, hasValidKey }: StatusIndicatorProps) {
  const getStatus = () => {
    if (!hasValidKey) return { text: 'Cần API Key', color: 'error' as const, icon: <Cancel /> };
    if (!isConnected) return { text: 'Anki Disconnected', color: 'warning' as const, icon: <Cancel /> };
    return { text: 'Sẵn sàng', color: 'success' as const, icon: <CheckCircle /> };
  };

  const status = getStatus();

  return (
    <Chip
      icon={status.icon}
      label={status.text}
      color={status.color}
      variant="filled"
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        px: 1,
        '& .MuiChip-icon': {
          fontSize: '1.1rem',
        },
      }}
    />
  );
}

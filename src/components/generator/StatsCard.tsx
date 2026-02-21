import { Paper, Typography, Box } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export function StatsCard({ title, value, icon, color = 'primary' }: StatsCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color === 'primary' ? '#2563eb' :
          color === 'success' ? '#10b981' :
            color === 'warning' ? '#f59e0b' : '#ef4444'} 0%, ${color === 'primary' ? '#7c3aed' :
              color === 'success' ? '#059669' :
                color === 'warning' ? '#d97706' : '#dc2626'} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ fontSize: '2rem', opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

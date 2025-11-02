import React from 'react';
import { Fab, Tooltip } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface SettingsFabProps {
  show?: boolean;
}

const SettingsFab: React.FC<SettingsFabProps> = ({ show = true }) => {
  const navigate = useNavigate();

  if (!show) return null;

  const handleClick = () => {
    navigate('/settings');
  };

  return (
    <Tooltip title="Cài đặt OpenAI API Key" placement="left">
      <Fab
        color="primary"
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3)',
        }}
      >
        <Settings />
      </Fab>
    </Tooltip>
  );
};

export default SettingsFab;
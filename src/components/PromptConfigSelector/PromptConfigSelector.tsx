import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Settings as SettingsIcon, Info as InfoIcon } from '@mui/icons-material';
import { usePromptConfig } from '../../contexts/PromptConfigContext';
import { PromptConfig } from '../../config/promptConfigs';

interface PromptConfigSelectorProps {
  open: boolean;
  onClose: () => void;
}

const ConfigCard: React.FC<{
  config: PromptConfig;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ config, isSelected, onSelect }) => {
  const [showDetails, setShowDetails] = React.useState(false);

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'passive': return 'success';
      case 'interactive': return 'warning';
      case 'typing': return 'info';
      default: return 'default';
    }
  };

  const getFocusColor = (focus: string) => {
    switch (focus) {
      case 'fluency': return 'primary';
      case 'accuracy': return 'secondary';
      case 'vocabulary': return 'success';
      case 'grammar': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card
      sx={{
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'grey.300',
        cursor: 'pointer',
        '&:hover': { boxShadow: 3 }
      }}
      onClick={onSelect}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="span">
              {config.icon}
            </Typography>
            <Typography variant="h6">
              {config.name}
            </Typography>
            {isSelected && <Chip label="Đang sử dụng" color="primary" size="small" />}
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            <InfoIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          {config.description}
        </Typography>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Chip
            label={config.settings.level}
            size="small"
            variant="outlined"
          />
          <Chip
            label={config.settings.focusArea}
            size="small"
            color={getFocusColor(config.settings.focusArea)}
          />
          <Chip
            label={config.settings.interactionMode}
            size="small"
            color={getModeColor(config.settings.interactionMode)}
          />
        </Box>

        {showDetails && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={1}>
            <Typography variant="subtitle2" gutterBottom>
              Ví dụ thẻ học:
            </Typography>
            <Box
              component="pre"
              sx={{
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: 'white',
                p: 1,
                borderRadius: 1,
                border: 1,
                borderColor: 'grey.300'
              }}
            >
              {config.exampleCard}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const PromptConfigSelector: React.FC<PromptConfigSelectorProps> = ({ open, onClose }) => {
  const { currentConfig, setConfigById, availableConfigs, isLoading } = usePromptConfig();
  const [selectedId, setSelectedId] = React.useState(currentConfig.id);

  React.useEffect(() => {
    setSelectedId(currentConfig.id);
  }, [currentConfig.id]);

  const handleSave = () => {
    if (selectedId !== currentConfig.id) {
      setConfigById(selectedId);
    }
    onClose();
  };

  const handleCardSelect = (configId: string) => {
    setSelectedId(configId);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { minHeight: '60vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SettingsIcon />
          Chọn phương pháp học
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          Chọn phương pháp học phù hợp với mục tiêu của bạn. Mỗi phương pháp có cách tạo thẻ và luyện tập khác nhau.
        </Alert>

        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {availableConfigs.map((config) => (
              <Grid item xs={12} key={config.id}>
                <ConfigCard
                  config={config}
                  isSelected={selectedId === config.id}
                  onSelect={() => handleCardSelect(config.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isLoading || selectedId === currentConfig.id}
        >
          {selectedId === currentConfig.id ? 'Đã chọn' : 'Áp dụng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromptConfigSelector;
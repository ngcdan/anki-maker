import { memo, useMemo, useCallback, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Divider,
  Collapse,
  Fade,
  Tooltip,
  ButtonGroup,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  VolumeUp,
  Delete,
  Restore,
  ExpandMore,
  EditNote,
  ContentCopy,
  Psychology,
  Translate,
} from '@mui/icons-material';
import { Note } from '../types';
import { useAppTheme, gradients, animations } from '../theme';

interface EnhancedNoteCardProps {
  note: Note;
  onCreate: () => void;
  onTrash: () => void;
  onPlayAudio?: (text: string) => void;
  isCreating?: boolean;
  isAudioLoading?: boolean;
}

const EnhancedNoteCard = memo<EnhancedNoteCardProps>(({
  note,
  onCreate,
  onTrash,
  onPlayAudio,
  isCreating = false,
  isAudioLoading = false,
}) => {
  const { mode } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Memoize computed values
  const cardStatus = useMemo(() => {
    if (note.created) return {
      color: 'success',
      icon: <CheckCircle />,
      text: 'Đã tạo',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981',
    };
    if (note.trashed) return {
      color: 'error',
      icon: <Cancel />,
      text: 'Đã xóa',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      borderColor: '#ef4444',
    };
    return {
      color: 'primary',
      icon: <Psychology />,
      text: 'Mới',
      bgColor: 'rgba(37, 99, 235, 0.1)',
      borderColor: '#2563eb',
    };
  }, [note.created, note.trashed]);

  const isDisabled = useMemo(() => {
    return note.created || note.trashed || isCreating;
  }, [note.created, note.trashed, isCreating]);

  // Memoize event handlers
  const handleCreate = useCallback(() => {
    if (!isDisabled) {
      onCreate();
    }
  }, [onCreate, isDisabled]);

  const handleTrash = useCallback(() => {
    if (note.created) {
      onTrash();
    } else if (!note.trashed) {
      onTrash();
    }
  }, [note, onTrash]);

  const handleRestore = useCallback(() => {
    if (note.trashed) {
      onTrash();
    }
  }, [note.trashed, onTrash]);

  const handlePlayAudio = useCallback(() => {
    if (onPlayAudio && note.fields.Audio) {
      onPlayAudio(note.fields.Audio);
    }
  }, [onPlayAudio, note.fields.Audio]);

  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev);
  }, []);

  // Content extraction
  const frontContent = note.fields.Front || note.fields.Question || '';
  const backContent = note.fields.Back || note.fields.Ans || '';

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          borderRadius: 4,
          border: `2px solid ${cardStatus.borderColor}`,
          background: mode === 'dark'
            ? `linear-gradient(135deg, ${cardStatus.bgColor}, rgba(0,0,0,0.1))`
            : `linear-gradient(135deg, ${cardStatus.bgColor}, rgba(255,255,255,0.8))`,
          transition: animations.hover,
          transform: note.trashed ? 'scale(0.98)' : 'scale(1)',
          opacity: note.trashed ? 0.7 : 1,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: note.trashed ? 'scale(0.98)' : 'scale(1.02)',
            boxShadow: `0 8px 32px ${cardStatus.bgColor}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${cardStatus.borderColor}, transparent)`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {cardStatus.icon}
                <Chip
                  label={cardStatus.text}
                  size="small"
                  sx={{
                    backgroundColor: cardStatus.bgColor,
                    color: cardStatus.borderColor,
                    fontWeight: 600,
                    border: `1px solid ${cardStatus.borderColor}`,
                  }}
                />
              </Box>
              {note.fields.Audio && (
                <Tooltip title="Có audio">
                  <VolumeUp fontSize="small" color="primary" />
                </Tooltip>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {note.modelName} • {note.deckName}
              </Typography>
              <IconButton
                size="small"
                onClick={toggleExpanded}
                sx={{
                  transition: 'transform 0.2s',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <ExpandMore />
              </IconButton>
            </Box>
          </Box>

          {/* Content Preview */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EditNote fontSize="small" color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Mặt trước
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleCopy(frontContent, 'front')}
                sx={{ ml: 'auto' }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              sx={{
                p: 2,
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                borderLeft: `4px solid ${cardStatus.borderColor}`,
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'none' : 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.6,
              }}
              dangerouslySetInnerHTML={{ __html: frontContent }}
            />
          </Box>

          {/* Expanded Content */}
          <Collapse in={expanded} timeout={300}>
            <Box>
              <Divider sx={{ my: 2 }} />

              {/* Back Content */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Translate fontSize="small" color="secondary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Mặt sau
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(backContent, 'back')}
                    sx={{ ml: 'auto' }}
                  >
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    p: 2,
                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 2,
                    borderLeft: '4px solid #7c3aed',
                    lineHeight: 1.6,
                  }}
                  dangerouslySetInnerHTML={{ __html: backContent }}
                />
              </Box>

              {/* Audio Section */}
              {note.fields.Audio && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VolumeUp fontSize="small" color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Audio
                    </Typography>
                  </Box>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: 2,
                  }}>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {note.fields.Audio}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handlePlayAudio}
                      disabled={isAudioLoading}
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {isAudioLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <VolumeUp fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {note.tags.map((tag, index) => (
                      <Chip
                        key={`${note.key}-tag-${index}`}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 500,
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Collapse>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            {note.trashed ? (
              <Button
                variant="outlined"
                startIcon={<Restore />}
                onClick={handleRestore}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'success.main',
                  color: 'success.main',
                  '&:hover': {
                    backgroundColor: 'success.main',
                    color: 'white',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Khôi phục
              </Button>
            ) : (
              <ButtonGroup variant="contained" sx={{ borderRadius: 2 }}>
                <Button
                  onClick={handleCreate}
                  disabled={isDisabled}
                  size="small"
                  startIcon={isCreating ? <CircularProgress size={16} /> : <CheckCircle />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    background: gradients.primary,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      transform: 'none',
                    },
                  }}
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo thẻ'}
                </Button>
                <Button
                  onClick={handleTrash}
                  disabled={isCreating}
                  size="small"
                  sx={{
                    backgroundColor: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.dark',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </Button>
              </ButtonGroup>
            )}
          </Box>

          {/* Copy Feedback */}
          {copied && (
            <Fade in timeout={200}>
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                  Đã copy {copied === 'front' ? 'mặt trước' : 'mặt sau'}!
                </Typography>
              </Box>
            </Fade>
          )}
        </CardContent>
      </Card>
    </Fade>
  );
});

EnhancedNoteCard.displayName = 'EnhancedNoteCard';

export default EnhancedNoteCard;
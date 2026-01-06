import { memo, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  VolumeUp,
  Delete,
  Restore,
} from '@mui/icons-material';
import { Note } from '../../types';

interface NoteCardProps {
  note: Note;
  onCreateCard: (note: Note) => void;
  onTrashCard: (note: Note) => void;
  onPlayAudio?: (text: string) => void;
  isCreating?: boolean;
  isAudioLoading?: boolean;
}

const NoteCard = memo<NoteCardProps>(({
  note,
  onCreateCard,
  onTrashCard,
  onPlayAudio,
  isCreating = false,
  isAudioLoading = false,
}) => {
  // Memoize computed values
  const cardStatusIcon = useMemo(() => {
    if (note.created) return <CheckCircle color="success" />;
    if (note.trashed) return <Cancel color="error" />;
    return null;
  }, [note.created, note.trashed]);

  const cardStatusText = useMemo(() => {
    if (note.created) return 'Đã tạo';
    if (note.trashed) return 'Đã xóa';
    return 'Chờ xử lý';
  }, [note.created, note.trashed]);

  const isDisabled = useMemo(() => {
    return note.created || note.trashed || isCreating;
  }, [note.created, note.trashed, isCreating]);

  // Memoize event handlers
  const handleCreateCard = useCallback(() => {
    if (!isDisabled) {
      onCreateCard(note);
    }
  }, [note, onCreateCard, isDisabled]);

  const handleTrashCard = useCallback(() => {
    if (note.created) {
      // If card is created, this becomes a delete action
      onTrashCard(note);
    } else if (!note.trashed) {
      // If card is not trashed, trash it
      onTrashCard(note);
    }
  }, [note, onTrashCard]);

  const handleRestoreCard = useCallback(() => {
    if (note.trashed) {
      onTrashCard({ ...note, trashed: false });
    }
  }, [note, onTrashCard]);

  const handlePlayAudio = useCallback(() => {
    if (onPlayAudio && note.fields.Audio) {
      onPlayAudio(note.fields.Audio);
    }
  }, [onPlayAudio, note.fields.Audio]);

  // Memoize chip colors
  const chipProps = useMemo(() => {
    if (note.created) return { color: 'success' as const, variant: 'filled' as const };
    if (note.trashed) return { color: 'error' as const, variant: 'filled' as const };
    return { color: 'default' as const, variant: 'outlined' as const };
  }, [note.created, note.trashed]);

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        opacity: note.trashed ? 0.5 : 1,
        border: note.created ? '2px solid #4caf50' : note.trashed ? '2px solid #f44336' : undefined,
      }}
    >
      <CardContent>
        {/* Header with status */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {cardStatusIcon}
            <Chip
              label={cardStatusText}
              size="small"
              {...chipProps}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {note.modelName} • {note.deckName}
          </Typography>
        </Box>

        {/* Note Content */}
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Mặt trước:
          </Typography>
          <Typography
            variant="body1"
            dangerouslySetInnerHTML={{
              __html: note.fields.Front || note.fields.Question || ''
            }}
          />
        </Box>

        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Mặt sau:
          </Typography>
          <Typography
            variant="body1"
            dangerouslySetInnerHTML={{
              __html: note.fields.Back || note.fields.Ans || ''
            }}
          />
        </Box>

        {/* Audio Field */}
        {note.fields.Audio && (
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Audio:
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2">
                {note.fields.Audio}
              </Typography>
              {onPlayAudio && (
                <IconButton
                  size="small"
                  onClick={handlePlayAudio}
                  disabled={isAudioLoading}
                >
                  {isAudioLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <VolumeUp />
                  )}
                </IconButton>
              )}
            </Box>
          </Box>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Tags:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {note.tags.map((tag, index) => (
                <Chip
                  key={`${note.key}-tag-${index}`}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={1} justifyContent="flex-end">
          {note.trashed ? (
            <Button
              variant="outlined"
              startIcon={<Restore />}
              onClick={handleRestoreCard}
              size="small"
            >
              Khôi phục
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateCard}
                disabled={isDisabled}
                size="small"
                startIcon={isCreating ? <CircularProgress size={16} /> : <CheckCircle />}
              >
                {isCreating ? 'Đang tạo...' : 'Tạo thẻ'}
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleTrashCard}
                disabled={isCreating}
                size="small"
                startIcon={<Delete />}
              >
                Xóa
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

NoteCard.displayName = 'NoteCard';

export default NoteCard;
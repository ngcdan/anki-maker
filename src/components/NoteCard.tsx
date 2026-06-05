import React, { useState, memo, useMemo, useEffect } from 'react';
import {
  Card, CardContent, CardActions, Grid, TextField, Button, CircularProgress, Typography, Box, Chip, IconButton,
  Divider, Fade, Tooltip, Paper, useTheme, alpha
} from '@mui/material';
import {
  CheckCircle, Delete, ExpandMore, Psychology, Add, Visibility, VisibilityOff
} from '@mui/icons-material';
import { marked } from 'marked';

import { Note } from '../shared';
import { useAddNote } from '../hooks';

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
  onCreate: () => void;
}

const NoteCardModern: React.FC<NoteCardProps> = memo(({
  note,
  onDelete,
  onCreate,
}) => {
  const theme = useTheme();

  const [currentNote, setCurrentNote] = useState(note);
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const { mutate: addNote, isLoading } = useAddNote();

  const { modelName, deckName, fields, created } = currentNote;

  // Sync currentNote with note prop changes
  useEffect(() => {
    setCurrentNote(note);
  }, [note]);

  const cardStatus = useMemo(() => {
    if (created) return {
      color: 'success',
      icon: <CheckCircle />,
      text: 'Đã tạo',
      bgColor: alpha(theme.palette.success.main, 0.1),
      borderColor: theme.palette.success.main,
    };
    return {
      color: 'primary',
      icon: <Psychology />,
      text: 'Mới',
      bgColor: alpha(theme.palette.primary.main, 0.1),
      borderColor: theme.palette.primary.main,
    };
  }, [created, theme]);

  const isDisabled = useMemo(() => {
    return created || isLoading;
  }, [created, isLoading]);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name) {
      setCurrentNote(prev => ({
        ...prev,
        fields: { ...prev.fields, [event.target.name]: event.target.value },
      }));
    }
  };

  const handleAddNote = async () => {
    try {
      const updateFields = {
        ...currentNote.fields,
        Front: marked.parse(currentNote.fields.Front) as string,
        Back: marked.parse(currentNote.fields.Back) as string,
      };

      addNote(
        { ...currentNote, fields: updateFields },
        {
          onSuccess: () => {
            onCreate();
          },
          onError: (error) => {
            console.error('Error adding note:', error);
          },
        },
      );
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <Fade in timeout={300}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          borderRadius: 3,
          borderLeft: `4px solid ${cardStatus.borderColor}`,
          backgroundColor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {/* Header with Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            pb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={cardStatus.icon}
              label={cardStatus.text}
              color={cardStatus.color as any}
              size="small"
              sx={{
                fontWeight: 600,
                backgroundColor: cardStatus.bgColor,
                color: cardStatus.borderColor,
                border: `1px solid ${alpha(cardStatus.borderColor, 0.3)}`,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {modelName} • {deckName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={showPreview ? 'Ẩn preview' : 'Xem preview'}>
              <IconButton
                size="small"
                onClick={() => setShowPreview(!showPreview)}
                sx={{
                  color: showPreview ? 'primary.main' : 'text.secondary',
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                {showPreview ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>

            <Tooltip title={expanded ? 'Thu gọn' : 'Mở rộng'}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s',
                  color: 'text.secondary',
                  '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <ExpandMore />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, pt: 0 }}>
          {/* Preview Mode */}
          {showPreview && (
            <Box sx={{ mb: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                  Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Front/Question Preview */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Mặt trước:
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(fields.Front || fields.Question || '')
                    }}
                  />
                </Box>

                {/* Back/Answer Preview */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Mặt sau:
                  </Typography>
                  <Box
                    sx={{
                      mt: 0.5,
                      p: 1.5,
                      borderRadius: 1,
                      backgroundColor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(fields.Back || fields.Ans || '')
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          )}

          {/* Edit Mode - Only show when preview is hidden */}
          {!showPreview && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Deck" value={deckName} disabled size="small" fullWidth />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Note type" value={modelName} disabled size="small" fullWidth />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Front"
                  defaultValue={fields.Front}
                  multiline
                  rows={expanded ? 3 : 2}
                  name="Front"
                  onChange={handleFieldChange}
                  disabled={isLoading}
                  size="small"
                />
              </Grid>

              {fields.Question && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Question"
                    defaultValue={fields.Question}
                    multiline
                    rows={expanded ? 3 : 2}
                    name="Question"
                    onChange={handleFieldChange}
                    disabled={isLoading}
                    size="small"
                  />
                </Grid>
              )}

              {fields.Ans && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Answer"
                    defaultValue={fields.Ans}
                    multiline
                    rows={expanded ? 3 : 2}
                    name="Ans"
                    onChange={handleFieldChange}
                    disabled={isLoading}
                    size="small"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Back"
                  defaultValue={fields.Back}
                  multiline
                  rows={expanded ? 3 : 2}
                  name="Back"
                  onChange={handleFieldChange}
                  disabled={isLoading}
                  size="small"
                />
              </Grid>
            </Grid>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          {created ? (
            <Button
              size="small"
              color="error"
              onClick={onDelete}
              startIcon={<Delete />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                ml: 'auto',
              }}
            >
              Xóa khỏi danh sách
            </Button>
          ) : (
            <>
              <Button
                size="small"
                color="error"
                onClick={onDelete}
                disabled={isDisabled}
                startIcon={<Delete />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                Xóa
              </Button>

              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleAddNote}
                disabled={isDisabled}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Add />
                  )
                }
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  bgcolor: !isDisabled ? 'primary.main' : undefined,
                  '&:hover': {
                    bgcolor: !isDisabled ? 'primary.main' : undefined,
                  },
                }}
              >
                {isLoading ? 'Đang thêm...' : 'Tạo thẻ'}
              </Button>
            </>
          )}
        </CardActions>
      </Card>
    </Fade>
  );
});

NoteCardModern.displayName = 'NoteCard';

export default NoteCardModern;

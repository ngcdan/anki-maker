import React, { useState, useContext, memo, useMemo, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Fade,
  Tooltip,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  VolumeUp,
  Delete,
  ExpandMore,
  ContentCopy,
  Psychology,
  Add,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { marked } from 'marked';

import { Note } from '../../types';
import { useAddNote, useTags, useTTS } from '../../hooks';
import { OpenAIKeyContext } from '../../OpenAIKeyContext';
import { useAppTheme, gradients } from '../../theme';

interface NoteCardModernProps {
  note: Note;
  onTrash: () => void;
  onCreate: () => void;
}

const NoteCardModern: React.FC<NoteCardModernProps> = memo(({ note, onTrash, onCreate }) => {
  const theme = useTheme();
  const { mode } = useAppTheme();
  const [currentNote, setCurrentNote] = useState(note);
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Original NoteCard hooks
  const { mutate: addNote, isLoading } = useAddNote();
  const { data: allTags } = useTags();
  const { openAIKey } = useContext(OpenAIKeyContext);
  const { generateAudio, createAnkiAudioFile, isGenerating } = useTTS();

  const { modelName, deckName, fields, tags, trashed, created } = currentNote;

  // Memoize computed values
  const cardStatus = useMemo(() => {
    if (created) return {
      color: 'success',
      icon: <CheckCircle />,
      text: 'Đã tạo',
      bgColor: alpha(theme.palette.success.main, 0.1),
      borderColor: theme.palette.success.main,
    };
    if (trashed) return {
      color: 'error',
      icon: <Cancel />,
      text: 'Đã xóa',
      bgColor: alpha(theme.palette.error.main, 0.1),
      borderColor: theme.palette.error.main,
    };
    return {
      color: 'primary',
      icon: <Psychology />,
      text: 'Mới',
      bgColor: alpha(theme.palette.primary.main, 0.1),
      borderColor: theme.palette.primary.main,
    };
  }, [created, trashed, theme]);

  const isDisabled = useMemo(() => {
    return created || trashed || isLoading;
  }, [created, trashed, isLoading]);

  // Original NoteCard handlers
  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name) {
      setCurrentNote(prev => ({
        ...prev,
        fields: { ...prev.fields, [event.target.name]: event.target.value },
      }));
    }
  };

  const handleTagsChange = (_: any, newTags: string[]) => {
    setCurrentNote(prev => ({
      ...prev,
      tags: newTags,
    }));
  };

  const handleAddNote = async () => {
    try {
      const audioTexts = currentNote.fields.Audio || '';
      let fields = currentNote.fields;

      // Convert markdown to HTML
      const updateFields = {
        ...fields,
        Front: marked.parse(fields.Front),
        Back: marked.parse(fields.Back),
      };

      let migrateNote: any = { ...currentNote, fields: updateFields };

      // Handle TTS audio generation with OpenAI
      if (audioTexts && openAIKey) {
        const audioResponse = await generateAudio(audioTexts, openAIKey, {
          voice: 'alloy',
          speed: 1.0,
          model: 'tts-1',
        });

        if (audioResponse) {
          const audioFile = createAnkiAudioFile(
            audioResponse.audioBuffer,
            audioResponse.fileName
          );
          migrateNote.audio = [audioFile];
        }
      }

      addNote(migrateNote, {
        onSuccess: () => {
          onCreate();
        },
        onError: (error) => {
          console.error('Error adding note:', error);
        },
      });
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Enhanced handlers
  const handleCopy = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  const handlePlayAudio = useCallback(async (text: string) => {
    if (!openAIKey) return;

    try {
      const audioResponse = await generateAudio(text, openAIKey, {
        voice: 'alloy',
        speed: 1.0,
        model: 'tts-1',
      });

      if (audioResponse?.audioBuffer) {
        const audioBlob = new Blob([audioResponse.audioBuffer], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, [openAIKey, generateAudio]);

  // Don't render if note is trashed or created
  if (trashed || created) {
    return null;
  }

  return (
    <Grid item xs={12} md={6}>
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
            backgroundColor: mode === 'dark' ? 'grey.900' : 'background.paper',
            boxShadow: mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'dark'
                ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                : '0 8px 30px rgba(0, 0, 0, 0.12)',
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
                        backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.50',
                        border: `1px solid ${mode === 'dark' ? 'grey.700' : 'grey.200'}`,
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
                        backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.50',
                        border: `1px solid ${mode === 'dark' ? 'grey.700' : 'grey.200'}`,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(fields.Back || fields.Ans || '')
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            )}

            {/* Edit Mode */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Deck"
                  value={deckName}
                  disabled
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Note type"
                  value={modelName}
                  disabled
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  id="tags"
                  multiple
                  autoHighlight
                  freeSolo
                  size="small"
                  value={tags}
                  options={allTags || []}
                  onChange={handleTagsChange}
                  disabled={isDisabled}
                  renderInput={(params) => <TextField label="Tags" {...params} />}
                />
              </Grid>

              {/* Compact view by default, expanded when clicked */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Front"
                  defaultValue={fields.Front}
                  multiline
                  rows={expanded ? 3 : 2}
                  name="Front"
                  onChange={handleFieldChange}
                  disabled={isDisabled}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Copy">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(fields.Front, 'Front')}
                            sx={{ color: copied === 'Front' ? 'success.main' : 'text.secondary' }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {fields.Front && (
                          <Tooltip title="Play audio">
                            <IconButton
                              size="small"
                              onClick={() => handlePlayAudio(fields.Front)}
                              disabled={isGenerating}
                              sx={{ color: 'text.secondary' }}
                            >
                              {isGenerating ? <CircularProgress size={16} /> : <VolumeUp fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    ),
                  }}
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
                    disabled={isDisabled}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Copy">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(fields.Question, 'Question')}
                              sx={{ color: copied === 'Question' ? 'success.main' : 'text.secondary' }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Play audio">
                            <IconButton
                              size="small"
                              onClick={() => fields.Audio && handlePlayAudio(fields.Audio)}
                              disabled={isGenerating}
                              sx={{ color: 'text.secondary' }}
                            >
                              {isGenerating ? <CircularProgress size={16} /> : <VolumeUp fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ),
                    }}
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
                    disabled={isDisabled}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Copy">
                            <IconButton
                              size="small"
                              onClick={() => handleCopy(fields.Ans, 'Ans')}
                              sx={{ color: copied === 'Ans' ? 'success.main' : 'text.secondary' }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Play audio">
                            <IconButton
                              size="small"
                              onClick={() => fields.Audio && handlePlayAudio(fields.Audio)}
                              disabled={isGenerating}
                              sx={{ color: 'text.secondary' }}
                            >
                              {isGenerating ? <CircularProgress size={16} /> : <VolumeUp fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ),
                    }}
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
                  disabled={isDisabled}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Copy">
                          <IconButton
                            size="small"
                            onClick={() => handleCopy(fields.Back, 'Back')}
                            sx={{ color: copied === 'Back' ? 'success.main' : 'text.secondary' }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {fields.Back && (
                          <Tooltip title="Play audio">
                            <IconButton
                              size="small"
                              onClick={() => handlePlayAudio(fields.Back)}
                              disabled={isGenerating}
                              sx={{ color: 'text.secondary' }}
                            >
                              {isGenerating ? <CircularProgress size={16} /> : <VolumeUp fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    ),
                  }}
                />
              </Grid>

              {fields.Audio && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Audio"
                    defaultValue={fields.Audio}
                    multiline
                    rows={expanded ? 2 : 1}
                    name="Audio"
                    onChange={handleFieldChange}
                    disabled={isDisabled}
                    size="small"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Play audio">
                          <IconButton
                            size="small"
                            onClick={() => handlePlayAudio(fields.Audio)}
                            disabled={isGenerating}
                            sx={{ color: 'text.secondary' }}
                          >
                            {isGenerating ? <CircularProgress size={16} /> : <VolumeUp fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Button
              size="small"
              color="error"
              onClick={onTrash}
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
                (isLoading || isGenerating) ? (
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
                background: !isDisabled ? gradients.primary : undefined,
                '&:hover': {
                  background: !isDisabled ? gradients.primary : undefined,
                },
              }}
            >
              {isGenerating ? 'Tạo audio...' : isLoading ? 'Đang thêm...' : 'Tạo thẻ'}
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Grid>
  );
});

NoteCardModern.displayName = 'NoteCardModern';

export default NoteCardModern;
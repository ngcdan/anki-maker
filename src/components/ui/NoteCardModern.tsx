import React, { useState, useContext, memo, useMemo, useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Button,
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
  Restore,
  DeleteForever,
} from '@mui/icons-material';
import { marked } from 'marked';

import { Note } from '../../types';
import { useAddNote, useTTS } from '../../hooks';
import { OpenAIKeyContext } from '../../OpenAIKeyContext';
import { useAppTheme, gradients } from '../../theme';

interface NoteCardModernProps {
  note: Note;
  onTrash: () => void;
  onCreate: () => void;
  onRestore?: () => void;
  onDeletePermanent?: () => void;
}

const NoteCardModern: React.FC<NoteCardModernProps> = memo(({
  note,
  onTrash,
  onCreate,
  onRestore,
  onDeletePermanent
}) => {
  const theme = useTheme();
  const { mode } = useAppTheme();
  const [currentNote, setCurrentNote] = useState(note);
  const [expanded, setExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Mặc định hiển thị preview
  const [copied, setCopied] = useState<string | null>(null);

  // Original NoteCard hooks
  const { mutate: addNote, isLoading } = useAddNote();
  // Không cần fetch allTags nữa vì không hiển thị gợi ý
  const { openAIKey } = useContext(OpenAIKeyContext);
  const { generateAudio, createAnkiAudioFile, isGenerating } = useTTS();

  const { modelName, deckName, fields, trashed, created } = currentNote;

  // Sync currentNote with note prop changes
  useEffect(() => {
    setCurrentNote(note);
  }, [note]);

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

  // Chỉ disable khi đang loading, cho phép edit trong mọi trạng thái khác
  const isFieldDisabled = useMemo(() => {
    return isLoading || isGenerating;
  }, [isLoading, isGenerating]);

  // Original NoteCard handlers
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
      const audioTexts = currentNote.fields.Audio || '';
      let fields = currentNote.fields;

      // Convert markdown to HTML
      const updateFields = {
        ...fields,
        Front: marked(fields.Front),
        Back: marked(fields.Back),
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
            opacity: trashed ? 0.6 : 1,
            filter: trashed ? 'grayscale(50%)' : 'none',
            '&:hover': {
              transform: trashed ? 'none' : 'translateY(-2px)',
              boxShadow: trashed
                ? (mode === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)')
                : (mode === 'dark' ? '0 12px 40px rgba(0, 0, 0, 0.4)' : '0 8px 30px rgba(0, 0, 0, 0.12)'),
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
              <Tooltip title={showPreview ? 'Chỉnh sửa thẻ' : 'Xem preview HTML'}>
                <IconButton
                  size="small"
                  onClick={() => setShowPreview(!showPreview)}
                  sx={{
                    color: showPreview ? 'success.main' : 'primary.main',
                    backgroundColor: showPreview ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: showPreview ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.1)',
                    },
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
            {showPreview ? (
              /* Preview Mode */
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
                  🎯 Anki Card Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Front/Question Preview */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    🔍 Mặt trước:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: mode === 'dark' ? 'grey.800' : 'white',
                      border: `2px solid ${mode === 'dark' ? 'grey.700' : 'grey.200'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      minHeight: '60px',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: marked(fields.Front || fields.Question || 'Không có nội dung')
                    }}
                  />
                </Box>

                {/* Back/Answer Preview */}
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    💡 Mặt sau:
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: mode === 'dark' ? 'grey.800' : 'white',
                      border: `2px solid ${mode === 'dark' ? 'grey.700' : 'grey.200'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      minHeight: '80px',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: marked(fields.Back || fields.Ans || 'Không có nội dung')
                    }}
                  />
                </Box>

                {/* Audio info if available */}
                {fields.Audio && (
                  <Box sx={{ mt: 2, p: 1.5, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                    <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                      🔊 Audio: {fields.Audio.substring(0, 50)}{fields.Audio.length > 50 ? '...' : ''}
                    </Typography>
                  </Box>
                )}

                {/* Action buttons for preview */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Tooltip title="Copy Front HTML">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(fields.Front || fields.Question || '', 'Front HTML')}
                      sx={{ color: copied === 'Front HTML' ? 'success.main' : 'text.secondary' }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {fields.Audio && (
                    <Tooltip title="Play Audio">
                      <IconButton
                        size="small"
                        onClick={() => handlePlayAudio(fields.Audio)}
                        disabled={isGenerating}
                        sx={{ color: 'primary.main' }}
                      >
                        {isGenerating ? <CircularProgress size={16} /> : <VolumeUp fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Paper>
            ) : (
              /* Edit Mode */
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
                    disabled={isFieldDisabled}
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
                      disabled={isFieldDisabled}
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
                      disabled={isFieldDisabled}
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
                    disabled={isFieldDisabled}
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
                      disabled={isFieldDisabled}
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
            )}
          </CardContent>

          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            {trashed ? (
              // Thẻ đã trash: hiển thị khôi phục và xóa vĩnh viễn
              <>
                <Button
                  size="small"
                  color="primary"
                  onClick={onRestore}
                  startIcon={<Restore />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Khôi phục
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={onDeletePermanent}
                  startIcon={<DeleteForever />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Xóa vĩnh viễn
                </Button>
              </>
            ) : created ? (
              // Thẻ đã tạo: chỉ hiển thị xóa vĩnh viễn
              <Button
                size="small"
                color="error"
                onClick={onDeletePermanent}
                startIcon={<DeleteForever />}
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
              // Thẻ mới: hiển thị trash và tạo thẻ
              <>
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
              </>
            )}
          </CardActions>
        </Card>
      </Fade>
    </Grid>
  );
});

NoteCardModern.displayName = 'NoteCardModern';

export default NoteCardModern;
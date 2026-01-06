import React, { useState, useContext } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Grid,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';

import { Note } from '../../../types';
import { useAddNote, useTags, useTTS } from '../../../hooks';
import { OpenAIKeyContext } from '../../../OpenAIKeyContext';

interface NoteCardProps {
  note: Note;
  onTrash: () => void;
  onCreate: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onTrash, onCreate }) => {
  const [currentNote, setCurrentNote] = useState(note);
  const [previewTab, setPreviewTab] = useState(0);
  const { mutate: addNote, isLoading } = useAddNote();
  const { data: allTags } = useTags();
  const { openAIKey } = useContext(OpenAIKeyContext);
  const { generateAudio, createAnkiAudioFile, isGenerating } = useTTS();

  const { modelName, deckName, fields, tags, trashed, created } = currentNote;

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

      // The fields already contain styled HTML from addAnkiStyling, no need to parse markdown
      const updateFields = {
        ...fields,
        // Keep the styled HTML as-is for Front and Back
        Front: fields.Front,
        Back: fields.Back,
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

  // Don't render if note is trashed or created
  if (trashed || created) {
    return null;
  }

  return (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="Deck" value={deckName} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Note type" value={modelName} disabled />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                id="tags"
                multiple
                autoHighlight
                freeSolo
                value={tags}
                options={allTags || []}
                onChange={handleTagsChange}
                renderInput={(params) => <TextField label="Tags" {...params} />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Front (Preview)"
                defaultValue={fields.Front}
                multiline
                rows={6}
                name="Front"
                onChange={handleFieldChange}
                InputProps={{
                  style: { fontFamily: 'monospace', fontSize: '0.875rem' }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Answer"
                defaultValue={fields.Ans}
                multiline
                name="Ans"
                onChange={handleFieldChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Back (Preview)"
                defaultValue={fields.Back}
                multiline
                rows={6}
                name="Back"
                onChange={handleFieldChange}
                InputProps={{
                  style: { fontFamily: 'monospace', fontSize: '0.875rem' }
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
                  name="Audio"
                  onChange={handleFieldChange}
                />
              </Grid>
            )}

            {/* Preview Section */}
            <Grid item xs={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
                <Tabs value={previewTab} onChange={(_, newValue) => setPreviewTab(newValue)}>
                  <Tab label="Preview Front" />
                  <Tab label="Preview Back" />
                </Tabs>

                <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {previewTab === 0 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Front Preview:</Typography>
                      <Box
                        dangerouslySetInnerHTML={{ __html: currentNote.fields.Front }}
                        sx={{
                          '& .vocab-card': {
                            maxWidth: '100%',
                            margin: 0
                          }
                        }}
                      />
                    </Box>
                  )}
                  {previewTab === 1 && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Back Preview:</Typography>
                      <Box
                        dangerouslySetInnerHTML={{ __html: currentNote.fields.Back }}
                        sx={{
                          '& .vocab-card': {
                            maxWidth: '100%',
                            margin: 0
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button size="small" color="secondary" onClick={onTrash}>
            Trash
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={handleAddNote}
            disabled={isLoading || isGenerating}
            startIcon={(isLoading || isGenerating) ? <CircularProgress size={16} /> : null}
          >
            {isGenerating ? 'Tạo audio...' : isLoading ? 'Đang thêm...' : 'Add note'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};
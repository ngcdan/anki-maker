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
} from '@mui/material';
import { marked } from 'marked';

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
                label="Front"
                defaultValue={fields.Front}
                multiline
                name="Front"
                onChange={handleFieldChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Question"
                defaultValue={fields.Question}
                multiline
                name="Question"
                onChange={handleFieldChange}
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
                label="Back"
                defaultValue={fields.Back}
                multiline
                name="Back"
                onChange={handleFieldChange}
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
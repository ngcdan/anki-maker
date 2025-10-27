import { useState } from 'react';
import { Box, Button, Typography, Paper, Divider } from '@mui/material';
import { suggestAnkiNotes } from './openai';
import { addNote } from './anki';

export default function TestAnkiFormat() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testOpenAI = async () => {
    try {
      setError('');

      const options = {
        deckName: 'Test Deck',
        modelName: 'Basic',
        prompt: 'What is the capital of France?',
        tags: ['test'],
      };

      const notes = await suggestAnkiNotes('test-key', options, []);
      setResult({ type: 'openai', data: notes });
      console.log('OpenAI Result:', notes);
    } catch (err) {
      setError('OpenAI Error: ' + String(err));
    }
  };

  const testAnkiAdd = async () => {
    try {
      setError('');

      const testNote = {
        modelName: 'Basic',
        deckName: 'Test Deck',
        fields: {
          Front: 'Test Question',
          Back: 'Test Answer',
        },
        tags: ['test'],
      };

      const noteId = await addNote(testNote);
      setResult({ type: 'anki', data: noteId });
      console.log('Anki Add Result:', noteId);
    } catch (err) {
      setError('Anki Error: ' + String(err));
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Test Anki Format
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={testOpenAI}>
          Test OpenAI suggestAnkiNotes
        </Button>

        <Button variant="contained" onClick={testAnkiAdd}>
          Test Anki addNote
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      {result && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Result ({result.type}):
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </Paper>
      )}
    </Box>
  );
}
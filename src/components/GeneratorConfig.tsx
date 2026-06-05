import { Box, TextField, Button, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Send } from '@mui/icons-material';
import { ApiKeyManager } from '.';

interface GeneratorConfigProps {
  ankiLoading: boolean;
  ankiError: unknown;
  deckName: string;
  setDeckName: (name: string) => void;
  decks: string[];
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSuggestNotes: () => void;
  isLoading: boolean;
}

export function GeneratorConfig({
  ankiLoading,
  ankiError,
  deckName,
  setDeckName,
  decks,
  prompt,
  setPrompt,
  handleSuggestNotes,
  isLoading
}: GeneratorConfigProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      handleSuggestNotes();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'white',
        border: '1px solid',
        borderColor: 'grey.200',
        position: 'sticky',
        top: 24,
      }}
    >
      {ankiLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ApiKeyManager />

          <TextField
            fullWidth
            multiline
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập từ vựng hoặc chủ đề để tạo flashcards... (Ctrl+Enter để gửi)"
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="deck-label">Deck</InputLabel>
              <Select
                labelId="deck-label"
                label="Deck"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
              >
                {decks.map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!prompt.trim() || isLoading}
              startIcon={isLoading ? <CircularProgress size={16} /> : <Send />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1,
              }}
            >
              {isLoading ? 'Đang tạo...' : 'Tạo ghi chú'}
            </Button>
          </Box>
        </Box>
      )}

      {ankiError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {String(ankiError)}
        </Alert>
      )}
    </Box>
  );
}

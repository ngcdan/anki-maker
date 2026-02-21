import { Box, Typography, Divider, Alert, CircularProgress } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { ApiKeyManager, DeckSelector, TagSelector, AdvancedPromptInput } from '../forms';


interface GeneratorConfigProps {
  mode: 'light' | 'dark';
  ankiLoading: boolean;
  ankiError: unknown;
  deckName: string;
  setDeckName: (name: string) => void;
  decks: string[];
  currentTags: string[];
  setCurrentTags: (tags: string[]) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSuggestNotes: () => void;
  isLoading: boolean;
}

export function GeneratorConfig({
  mode,
  ankiLoading,
  ankiError,
  deckName,
  setDeckName,
  decks,
  currentTags,
  setCurrentTags,
  prompt,
  setPrompt,
  handleSuggestNotes,
  isLoading
}: GeneratorConfigProps) {
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 3,
        background: mode === 'dark' ? 'grey.900' : 'white',
        border: `1px solid ${mode === 'dark' ? 'grey.800' : 'grey.200'}`,
        position: 'sticky',
        top: 24,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Settings color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Cấu hình
        </Typography>
      </Box>

      {ankiLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ApiKeyManager />

          <Divider />

          <DeckSelector
            value={deckName}
            onChange={setDeckName}
            decks={decks}
          />

          <TagSelector
            value={currentTags}
            onChange={setCurrentTags}
          />

          <Divider />

          <AdvancedPromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={handleSuggestNotes}
            disabled={false} // Luôn cho phép nhập prompt
            loading={isLoading}
          />
        </Box>
      )}

      {/* Error Display */}
      {ankiError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
          {String(ankiError)}
        </Alert>
      )}
    </Box>
  );
}

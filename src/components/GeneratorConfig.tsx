import { Box, TextField, Button, Alert, CircularProgress, FormControl, InputLabel,
  Select, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Send, SmartToy, Edit } from '@mui/icons-material';
import { ApiKeyManager } from '.';
import { ManualEditor } from './ManualEditor';
import { AnkiNoteType, MediaAttachment, MediaType } from '../shared';
import { NOTE_TYPES } from '../shared/noteTypes';

type Mode = 'ai' | 'manual';

interface GeneratorConfigProps {
  ankiLoading: boolean;
  ankiError: unknown;
  deckName: string;
  setDeckName: (name: string) => void;
  decks: string[];
  noteType: AnkiNoteType;
  setNoteType: (type: AnkiNoteType) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleSuggestNotes: () => void;
  isLoading: boolean;
  manualFields: Record<string, string>;
  manualMedia: Record<string, MediaAttachment>;
  onManualFieldChange: (name: string, value: string) => void;
  onManualMediaAdd: (fieldName: string, base64: string, filename: string, type: MediaType) => void;
  onManualMediaRemove: (fieldName: string) => void;
  onManualSubmit: () => void;
}

export function GeneratorConfig({
  ankiLoading, ankiError, deckName, setDeckName, decks,
  noteType, setNoteType, mode, setMode,
  prompt, setPrompt, handleSuggestNotes, isLoading,
  manualFields, manualMedia, onManualFieldChange,
  onManualMediaAdd, onManualMediaRemove, onManualSubmit,
}: GeneratorConfigProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) handleSuggestNotes();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box sx={{ p: 3, borderRadius: 3, background: 'white', border: '1px solid', borderColor: 'grey.200', position: 'sticky', top: 24 }}>
      {ankiLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <ApiKeyManager />

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            size="small"
            fullWidth
          >
            <ToggleButton value="ai"><SmartToy sx={{ mr: 1 }} fontSize="small" />AI Generate</ToggleButton>
            <ToggleButton value="manual"><Edit sx={{ mr: 1 }} fontSize="small" />Manual</ToggleButton>
          </ToggleButtonGroup>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Note Type</InputLabel>
              <Select label="Note Type" value={noteType} onChange={(e) => setNoteType(e.target.value as AnkiNoteType)}>
                {NOTE_TYPES.map(t => (
                  <MenuItem key={t.name} value={t.name}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Deck</InputLabel>
              <Select label="Deck" value={deckName} onChange={(e) => setDeckName(e.target.value)}>
                {decks.map(name => (
                  <MenuItem key={name} value={name}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {mode === 'ai' && (
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth multiline rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập nội dung để AI tạo flashcard... (Ctrl+Enter để gửi)"
                variant="outlined" size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                type="submit" variant="contained" fullWidth
                disabled={!prompt.trim() || isLoading}
                startIcon={isLoading ? <CircularProgress size={16} /> : <Send />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1 }}
              >
                {isLoading ? 'Đang tạo...' : 'Tạo ghi chú'}
              </Button>
            </Box>
          )}

          {mode === 'manual' && (
            <ManualEditor
              noteType={noteType}
              fields={manualFields}
              media={manualMedia}
              onFieldChange={onManualFieldChange}
              onMediaAdd={onManualMediaAdd}
              onMediaRemove={onManualMediaRemove}
              onSubmit={onManualSubmit}
              isLoading={isLoading}
            />
          )}
        </Box>
      )}

      {ankiError && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{String(ankiError)}</Alert>
      )}
    </Box>
  );
}

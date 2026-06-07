import { Box, Container, Grid, Typography, LinearProgress } from '@mui/material';
import { useState, useEffect, useContext } from 'react';
import { GeneratorConfig, NotesList } from '../components';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ankiService } from '../services/ankiService';
import { openaiService } from '../services/openaiService';
import { OpenAIKeyContext } from '../contexts/OpenAIKeyContext';
import { DEFAULT_SETTINGS } from '../shared';
import { useLocalStorage } from '../hooks';
import { Note, AnkiNoteType, MediaAttachment, MediaType } from '../shared';
import { getFieldsForType } from '../shared/noteTypes';

function App() {
  const query = new URLSearchParams(window.location.search);
  const promptParam = query.get('prompt') || '';

  // State
  const [prompt, setPrompt] = useState(promptParam);
  const [deckName, setDeckName] = useLocalStorage<string>('deckName', DEFAULT_SETTINGS.deckName);
  const [noteType, setNoteType] = useLocalStorage<AnkiNoteType>('noteType', 'Basic');
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);

  // Manual mode state
  const [manualFields, setManualFields] = useState<Record<string, string>>({});
  const [manualMedia, setManualMedia] = useState<Record<string, MediaAttachment>>({});

  // OpenAI Key context
  const { openAIKey } = useContext(OpenAIKeyContext);
  const hasValidKey = openAIKey && openAIKey.startsWith('sk-') && openAIKey.length > 20;

  const feedback = {
    success: (_msg: string) => {},
    error: (msg: string) => alert(msg),
    warning: (msg: string) => alert(msg),
    info: (_msg: string) => {},
  };

  // Fetch Anki data
  const { data: decks = [], isLoading: decksLoading, error: decksError } = useQuery({
    queryKey: ['decks'],
    queryFn: () => ankiService.fetchDecks(),
    staleTime: 5 * 60 * 1000,
  });

  const isConnected = !decksError;
  const ankiLoading = decksLoading;
  const ankiError = decksError;

  // Reset manual fields when noteType changes
  useEffect(() => {
    const fields = getFieldsForType(noteType);
    setManualFields(fields.reduce((acc, f) => ({ ...acc, [f]: '' }), {} as Record<string, string>));
    setManualMedia({});
  }, [noteType]);

  // AI Generation mutation
  const generateNotesMutation = useMutation({
    mutationFn: async (promptText: string) => {
      const note = await openaiService.generateNote(openAIKey, {
        deckName,
        modelName: noteType,
        prompt: promptText,
        tags: [],
        noteType,
      });
      return { ...note, created: false };
    },
    onSuccess: (note) => {
      setPendingNotes(prev => [...prev, note]);
    },
    onError: (error) => {
      feedback.error('Có lỗi khi tạo thẻ học: ' + String(error));
    },
  });

  // Auto-suggest on initial prompt
  useEffect(() => {
    if (promptParam.trim() !== '' && hasValidKey && isConnected) {
      handleSuggestNotes();
    }
  }, [promptParam, hasValidKey, isConnected]);

  const handleSuggestNotes = () => {
    if (!prompt.trim()) {
      feedback.warning('Vui lòng nhập nội dung để tạo thẻ');
      return;
    }
    if (!hasValidKey) {
      feedback.error('Vui lòng cấu hình OpenAI API key');
      return;
    }
    if (!isConnected) {
      feedback.error('Không thể kết nối đến Anki. Vui lòng kiểm tra AnkiConnect');
      return;
    }
    generateNotesMutation.mutate(prompt.trim());
  };

  // Manual mode handlers
  const onManualFieldChange = (name: string, value: string) => {
    setManualFields(prev => ({ ...prev, [name]: value }));
  };

  const onManualMediaAdd = (fieldName: string, base64: string, filename: string, type: MediaType) => {
    setManualMedia(prev => ({
      ...prev,
      [fieldName]: { data: base64, filename, fields: [fieldName], type },
    }));
  };

  const onManualMediaRemove = (fieldName: string) => {
    setManualMedia(prev => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleManualSubmit = () => {
    const mediaList = Object.values(manualMedia);
    const note: Note = {
      key: crypto.randomUUID(),
      modelName: noteType,
      deckName,
      fields: { ...manualFields },
      tags: [],
      media: mediaList.length > 0 ? mediaList : undefined,
    };
    setPendingNotes(prev => [...prev, note]);
    // Reset form
    const fields = getFieldsForType(noteType);
    setManualFields(fields.reduce((acc, f) => ({ ...acc, [f]: '' }), {} as Record<string, string>));
    setManualMedia({});
  };

  const handleCreateCard = (note: Note) => {
    setPendingNotes(prev => prev.filter(n => n.key !== note.key));
  };

  const handleDeleteNote = (noteKey: string) => {
    setPendingNotes(prev => prev.filter(n => n.key !== noteKey));
  };

  const handleClearAll = () => {
    setPendingNotes([]);
  };

  const showProgress = generateNotesMutation.isLoading;

  return (
    <Container maxWidth={false} sx={{ p: 1, px: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showProgress && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ borderRadius: 1, height: 4, backgroundColor: 'grey.200' }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Đang tạo ghi chú với AI...
          </Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} lg={4}>
          <GeneratorConfig
            ankiLoading={ankiLoading}
            ankiError={ankiError}
            deckName={deckName}
            setDeckName={setDeckName}
            decks={decks}
            noteType={noteType}
            setNoteType={setNoteType}
            mode={mode}
            setMode={setMode}
            prompt={prompt}
            setPrompt={setPrompt}
            handleSuggestNotes={handleSuggestNotes}
            isLoading={generateNotesMutation.isLoading}
            manualFields={manualFields}
            manualMedia={manualMedia}
            onManualFieldChange={onManualFieldChange}
            onManualMediaAdd={onManualMediaAdd}
            onManualMediaRemove={onManualMediaRemove}
            onManualSubmit={handleManualSubmit}
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <NotesList
            pendingNotes={pendingNotes}
            isLoading={generateNotesMutation.isLoading}
            handleClearAll={handleClearAll}
            handleCreateCard={handleCreateCard}
            handleDeleteNote={handleDeleteNote}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;

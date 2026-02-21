import { Box, Container, Grid, Typography, LinearProgress } from '@mui/material';

import { useState, useEffect } from 'react';

import {
  GeneratorConfig,
  NotesList
} from '../components';

// Import original functions
import { useQuery, useMutation } from '@tanstack/react-query';
import { ankiService } from '../services/ankiService';
import { openaiService } from '../services/openaiService';
import { OpenAIKeyContext } from '../contexts/OpenAIKeyContext';
import { useContext } from 'react';
import { marked } from 'marked';

import { DEFAULT_SETTINGS } from '../shared';
import { useLocalStorage } from '../hooks';
import { Note } from '../shared';



function App() {
  const query = new URLSearchParams(window.location.search);
  const promptParam = query.get('prompt') || '';

  // Local state
  const [prompt, setPrompt] = useState(promptParam);
  const [deckName, setDeckName] = useLocalStorage<string>('deckName', DEFAULT_SETTINGS.deckName);
  const [currentTags, setCurrentTags] = useLocalStorage<string[]>('tags', []);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);

  // OpenAI Key context
  const { openAIKey } = useContext(OpenAIKeyContext);
  const hasValidKey = openAIKey && openAIKey.startsWith('sk-') && openAIKey.length > 20;

  // Simple feedback fallback
  const feedback = {
    success: (msg: string) => console.log(msg),
    error: (msg: string) => alert(msg),
    warning: (msg: string) => alert(msg),
    info: (msg: string) => console.log(msg),
  };

  // Fetch Anki data
  const { data: decks = [], isLoading: decksLoading, error: decksError } = useQuery({
    queryKey: ['decks'],
    queryFn: () => ankiService.fetchDecks(),
    staleTime: 5 * 60 * 1000,
  });

  // Anki connection status
  const isConnected = !decksError;
  const ankiLoading = decksLoading;
  const ankiError = decksError;

  const modelName = DEFAULT_SETTINGS.modelName;

  // AI Generation mutation
  const generateNotesMutation = useMutation({
    mutationFn: async (promptText: string) => {
      const options = {
        deckName,
        modelName,
        prompt: promptText,
        tags: currentTags,
      };

      const rawNotes = await openaiService.suggestAnkiNotes(openAIKey, options);

      // Convert raw notes to proper Note format
      const convertedNotes: Note[] = rawNotes.map((rawNote: any) => ({
        key: rawNote.key,
        modelName: rawNote.modelName,
        deckName: rawNote.deckName,
        fields: {
          Front: rawNote.fields.Front || '',
          Back: rawNote.fields.Back || '',
          Question: rawNote.fields.Question || '',
          Ans: rawNote.fields.Ans || '',
          Audio: rawNote.fields.Audio || '',
        },
        tags: rawNote.tags || [],
        trashed: false,
        created: false,
      }));

      return convertedNotes;
    },
    onSuccess: (notes) => {
      // Thêm vào pendingNotes thay vì thay thế
      setPendingNotes(prev => [...prev, ...notes]);
      feedback.success(`Đã tạo ${notes.length} thẻ học mới! Tổng cộng: ${pendingNotes.length + notes.length} thẻ`);
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

  // Handle suggesting notes
  const handleSuggestNotes = () => {
    if (!prompt.trim()) {
      feedback.warning('Vui lòng nhập nội dung để tạo thẻ');
      return;
    }

    if (!hasValidKey) {
      feedback.error('Vui lòng cấu hình OpenAI API key trong Settings');
      return;
    }

    if (!isConnected) {
      feedback.error('Không thể kết nối đến Anki. Vui lòng kiểm tra AnkiConnect');
      return;
    }

    feedback.info('Đang tạo thẻ học từ nội dung của bạn...');
    generateNotesMutation.mutate(prompt.trim());
  };

  const handleCreateCard = async (note: Note) => {
    console.log('call handle create card');
    console.log(note);

    try {
      // Convert markdown to HTML for Front/Back before adding
      const convertedFields = {
        ...note.fields,
        Front: note.fields.Front ? marked.parse(note.fields.Front) : note.fields.Front,
        Back: note.fields.Back ? marked.parse(note.fields.Back) : note.fields.Back,
      };

      // Convert Note to addNote format
      const ankiNote = {
        modelName: note.modelName,
        deckName: note.deckName,
        fields: convertedFields,
        tags: note.tags,
      };

      // Simulate successful creation without calling Anki
      console.log('Would create Anki note:', ankiNote);

      // Update note status
      setPendingNotes(prev =>
        prev.map(n => n.key === note.key ? { ...n, created: true } : n)
      );

      // Show success message
      feedback.success('Thẻ đã được đánh dấu là đã tạo (không gọi Anki)');
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const handleTrashNote = (noteKey: string) => {
    setPendingNotes(prev =>
      prev.map(n => n.key === noteKey ? { ...n, trashed: true } : n)
    );
    feedback.info('Đã xóa thẻ');
  };

  const handleRestoreNote = (noteKey: string) => {
    setPendingNotes(prev =>
      prev.map(n => n.key === noteKey ? { ...n, trashed: false } : n)
    );
    feedback.success('Đã khôi phục thẻ');
  };

  const handleDeletePermanent = (noteKey: string) => {
    setPendingNotes(prev => prev.filter(n => n.key !== noteKey));
    feedback.info('Đã xóa thẻ khỏi danh sách');
  };

  const handleClearAll = () => {
    setPendingNotes([]);
    feedback.info('Đã xóa tất cả thẻ');
  };

  const showProgress = generateNotesMutation.isLoading;

  return (
    <Container maxWidth={false} sx={{ p: 1, px: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Progress Bar (if generating) */}
      {showProgress && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            sx={{
              borderRadius: 1,
              height: 4,
              backgroundColor: 'grey.200',
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Đang tạo ghi chú với AI...
          </Typography>
        </Box>
      )}

      {/* Stats Cards */}


      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Panel - Form */}
        <Grid item xs={12} lg={4}>
          <GeneratorConfig
            ankiLoading={ankiLoading}
            ankiError={ankiError}
            deckName={deckName}
            setDeckName={setDeckName}
            decks={decks}
            currentTags={currentTags}
            setCurrentTags={setCurrentTags}
            prompt={prompt}
            setPrompt={setPrompt}
            handleSuggestNotes={handleSuggestNotes}
            isLoading={generateNotesMutation.isLoading}
          />
        </Grid>

        {/* Right Panel - Notes */}
        <Grid item xs={12} lg={8}>
          <NotesList
            pendingNotes={pendingNotes}
            isLoading={generateNotesMutation.isLoading}
            handleClearAll={handleClearAll}
            handleCreateCard={handleCreateCard}
            handleTrashNote={handleTrashNote}
            handleRestoreNote={handleRestoreNote}
            handleDeletePermanent={handleDeletePermanent}
          />
        </Grid>
      </Grid>

    </Container>
  );
}

export default App;
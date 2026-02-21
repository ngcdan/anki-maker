import { Box, Container, Grid, Typography, Button, LinearProgress } from '@mui/material';
import { AutoAwesome, Settings, Psychology, TrendingUp, CheckCircle, Cancel } from '@mui/icons-material';

import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import {
  GeneratorConfig,
  NotesList,
  StatsCard,
  StatusIndicator
} from '../components/generator';
import FeedbackSystem, { useFeedback } from '../components/feedback/FeedbackSystem';

// Import original functions
import { useQuery, useMutation } from '@tanstack/react-query';
import { ankiService } from '../services/anki';
import { openaiService } from '../services/openai';
import { OpenAIKeyContext } from '../contexts/OpenAIKeyContext';
import { useContext } from 'react';
import { marked } from 'marked';

import { DEFAULT_SETTINGS } from '../shared';
import { useAppTheme, gradients } from '../theme';
import { useLocalStorage } from '../hooks';
import { Note } from '../shared';



function App() {
  const { mode } = useAppTheme();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const promptParam = query.get('prompt') || '';

  // Local state
  const [prompt, setPrompt] = useState(promptParam);
  const [deckName, setDeckName] = useLocalStorage<string>('deckName', DEFAULT_SETTINGS.deckName);
  const [currentTags, setCurrentTags] = useLocalStorage<string[]>('tags', []);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);

  // OpenAI Key context
  const { openAIKey } = useContext(OpenAIKeyContext);
  const hasValidKey = openAIKey && openAIKey.startsWith('sk-') && openAIKey.length > 20;

  // Feedback system
  const feedback = useFeedback();

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


  // Stats calculations
  const stats = {
    total: pendingNotes.length,
    created: pendingNotes.filter(note => note.created).length,
    pending: pendingNotes.filter(note => !note.created && !note.trashed).length,
    trashed: pendingNotes.filter(note => note.trashed).length,
  };

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

    feedback.info('Đang tạo thẻ học từ nội dung của bạn...', { duration: 2000 });
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
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                background: gradients.primary,
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesome sx={{ color: 'white', fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                AI Card Generator
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tạo flashcards thông minh với AI
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StatusIndicator isConnected={isConnected} hasValidKey={hasValidKey} />
            <Button
              variant="outlined"
              size="small"
              startIcon={<Settings />}
              href="/settings"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Settings
            </Button>
          </Box>
        </Box>

        {/* Progress Bar */}
        {showProgress && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              sx={{
                borderRadius: 1,
                height: 6,
                backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.200',
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Đang tạo ghi chú với AI...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Stats Cards */}
      {stats.total > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatsCard
              title="Tổng cộng"
              value={stats.total}
              icon={<Psychology />}
              color="primary"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard
              title="Đã tạo"
              value={stats.created}
              icon={<CheckCircle />}
              color="success"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard
              title="Chờ xử lý"
              value={stats.pending}
              icon={<TrendingUp />}
              color="warning"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatsCard
              title="Đã xóa"
              value={stats.trashed}
              icon={<Cancel />}
              color="error"
            />
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Panel - Form */}
        <Grid item xs={12} lg={4}>
          <GeneratorConfig
            mode={mode}
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
            mode={mode}
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

      {/* Enhanced Feedback System */}
      <FeedbackSystem
        messages={feedback.messages}
        onDismiss={feedback.dismissMessage}
        position="top-right"
        maxVisible={3}
      />
    </Container>
  );
}

export default App;
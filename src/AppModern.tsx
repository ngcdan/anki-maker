import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Divider,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  AutoAwesome,
  Settings,
  Psychology,
  TrendingUp,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { DeckSelector, TagSelector, FormSkeleton, NoteCardSkeleton } from './components';
import { AdvancedPromptInput } from './components/AdvancedPromptInput';
import EnhancedNoteCardV2 from './components/EnhancedNoteCardV2';
import EnhancedFeedback, { useFeedback } from './components/EnhancedFeedback';

// Import original functions
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchDecks, fetchTags, addNote } from './anki';
import { suggestAnkiNotes } from './openai';
import { OpenAIKeyContext } from './OpenAIKeyContext';
import { useContext } from 'react';

import { DEFAULT_SETTINGS } from './constants';
import { useAppTheme, gradients } from './theme';
import useLocalStorage from './useLocalStorage';
import { Note } from './types';

function StatsCard({ title, value, icon, color = 'primary' }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color === 'primary' ? '#2563eb' :
          color === 'success' ? '#10b981' :
            color === 'warning' ? '#f59e0b' : '#ef4444'} 0%, ${color === 'primary' ? '#7c3aed' :
              color === 'success' ? '#059669' :
                color === 'warning' ? '#d97706' : '#dc2626'} 100%)`,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ fontSize: '2rem', opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </Paper>
  );
}

function StatusIndicator({ isConnected, hasValidKey }: {
  isConnected: boolean;
  hasValidKey: boolean;
}) {
  const getStatus = () => {
    if (!hasValidKey) return { text: 'Cần API Key', color: 'error' as const, icon: <Cancel /> };
    if (!isConnected) return { text: 'Anki Disconnected', color: 'warning' as const, icon: <Cancel /> };
    return { text: 'Sẵn sàng', color: 'success' as const, icon: <CheckCircle /> };
  };

  const status = getStatus();

  return (
    <Chip
      icon={status.icon}
      label={status.text}
      color={status.color}
      variant="filled"
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        px: 1,
        '& .MuiChip-icon': {
          fontSize: '1.1rem',
        },
      }}
    />
  );
}

function App() {
  const { mode } = useAppTheme();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const promptParam = query.get('prompt') || '';

  // Local state
  const [prompt, setPrompt] = useState(promptParam);
  const [deckName, setDeckName] = useLocalStorage<string>('deckName', DEFAULT_SETTINGS.deckName);
  const [currentTags, setCurrentTags] = useLocalStorage<string[]>('tags', DEFAULT_SETTINGS.tags);
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);

  // OpenAI Key context
  const { openAIKey } = useContext(OpenAIKeyContext);
  const hasValidKey = openAIKey && openAIKey.startsWith('sk-') && openAIKey.length > 20;

  // Feedback system
  const feedback = useFeedback();

  // Fetch Anki data
  const { data: decks = [], isLoading: decksLoading, error: decksError } = useQuery({
    queryKey: ['decks'],
    queryFn: fetchDecks,
    staleTime: 5 * 60 * 1000,
  });

  const { data: tags = [], isLoading: tagsLoading, error: tagsError } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000,
  });

  // Anki connection status
  const isConnected = !decksError && !tagsError;
  const ankiLoading = decksLoading || tagsLoading;
  const ankiError = decksError || tagsError;

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

      const rawNotes = await suggestAnkiNotes(openAIKey, options, pendingNotes);

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
      setPendingNotes(notes);
      feedback.success(`Đã tạo ${notes.length} thẻ học thành công!`);
    },
    onError: (error) => {
      feedback.error('Có lỗi khi tạo thẻ học: ' + String(error));
    },
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: addNote,
    onSuccess: () => {
      feedback.success('Đã thêm thẻ vào Anki thành công!');
    },
    onError: (error) => {
      feedback.error('Có lỗi khi thêm thẻ vào Anki: ' + String(error));
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
    try {
      // Convert Note to addNote format
      const ankiNote = {
        modelName: note.modelName,
        deckName: note.deckName,
        fields: note.fields,
        tags: note.tags,
      };

      await addNoteMutation.mutateAsync(ankiNote);
      // Update note status
      setPendingNotes(prev =>
        prev.map(n => n.key === note.key ? { ...n, created: true } : n)
      );
    } catch (error) {
      console.error('Error creating card:', error);
    }
  }; const handleTrashNote = (noteKey: string) => {
    setPendingNotes(prev =>
      prev.map(n => n.key === noteKey ? { ...n, trashed: true } : n)
    );
    feedback.info('Đã xóa thẻ');
  };

  const isFormReady = hasValidKey && isConnected && !ankiLoading;
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
          <StatusIndicator isConnected={isConnected} hasValidKey={hasValidKey} />
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
          <Paper
            elevation={0}
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
              <FormSkeleton />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <DeckSelector
                  value={deckName}
                  onChange={setDeckName}
                  decks={decks}
                  disabled={!isConnected}
                />

                <TagSelector
                  value={currentTags}
                  onChange={setCurrentTags}
                  options={tags}
                  disabled={!isConnected}
                />

                <Divider />

                <AdvancedPromptInput
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleSuggestNotes}
                  disabled={!isFormReady}
                  loading={generateNotesMutation.isLoading}
                />
              </Box>
            )}

            {/* Error Display */}
            {ankiError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {String(ankiError)}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Panel - Notes */}
        <Grid item xs={12} lg={8}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Ghi chú được tạo ({pendingNotes.length})
            </Typography>

            {generateNotesMutation.isLoading ? (
              <Grid container spacing={2} alignItems="stretch">
                {Array.from({ length: 2 }).map((_, index) => (
                  <NoteCardSkeleton key={`skeleton-${index}`} />
                ))}
              </Grid>
            ) : pendingNotes.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 3,
                  background: mode === 'dark' ? 'grey.900' : 'grey.50',
                  border: `2px dashed ${mode === 'dark' ? 'grey.700' : 'grey.300'}`,
                }}
              >
                <Psychology sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Chưa có ghi chú nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nhập prompt và nhấn "Tạo ghi chú" để bắt đầu
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2} alignItems="stretch">
                {pendingNotes.filter(note => !note.trashed).map((note) => (
                  <EnhancedNoteCardV2
                    key={note.key}
                    note={note}
                    onCreate={() => handleCreateCard(note)}
                    onTrash={() => handleTrashNote(note.key)}
                  />
                ))}
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Enhanced Feedback System */}
      <EnhancedFeedback
        messages={feedback.messages}
        onDismiss={feedback.dismissMessage}
        position="top-right"
        maxVisible={3}
      />
    </Container>
  );
}

export default App;
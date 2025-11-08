import {
  Alert, Button, CircularProgress, Grid, Container
} from '@mui/material';

import { useLocation } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';

import { NoteCard, DeckSelector, TagSelector, PromptInput, NoteCardSkeleton, FormSkeleton } from '../../components';
import { fetchDecks, addNote } from '../../anki';
import { suggestAnkiNotes } from '../../openai';
import { OpenAIKeyContext } from '../../OpenAIKeyContext';
import { ERROR_MESSAGES, DEFAULT_SETTINGS } from '../../constants';
import { Note } from '../../types';
import useLocalStorage from '../../useLocalStorage';
import FeedbackSystem, { useFeedback } from '../../components/ui/FeedbackSystem';
import { getRandomPrompt } from '../../utils/samplePrompts';

// Note management hook simplified
const useSimpleNoteManagement = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const addNotes = (newNotes: Note[]) => {
    setNotes(prevNotes => [...prevNotes, ...newNotes]);
  };

  const trashNote = (key: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.key === key ? { ...note, trashed: true } : note
      )
    );
  };

  const createNote = (key: string) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.key === key ? { ...note, created: true } : note
      )
    );
  };

  const pendingNotes = notes.filter(note => !note.trashed);

  return {
    pendingNotes,
    actions: {
      addNotes,
      trashNote,
      createNote,
    }
  };
};

function AppSimple() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const promptParam = query.get('prompt') || '';

  // Local state
  const [prompt, setPrompt] = useState(promptParam);
  const [deckName, setDeckName] = useLocalStorage<string>('deckName', DEFAULT_SETTINGS.deckName);
  const [currentTags, setCurrentTags] = useLocalStorage<string[]>('tags', DEFAULT_SETTINGS.tags);

  // Note management
  const { pendingNotes, actions } = useSimpleNoteManagement();

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

  // Anki connection status
  const isConnected = !decksError;
  const ankiLoading = decksLoading;
  const ankiError = decksError; const modelName = DEFAULT_SETTINGS.modelName;

  // AI Generation mutation
  const suggestNotesMutation = useMutation({
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
      actions.addNotes(notes);
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

  // Auto-suggest on initial prompt
  useEffect(() => {
    if (promptParam.trim() !== '' && hasValidKey && isConnected) {
      handleSuggestNotes();
    }
  }, [promptParam, hasValidKey, isConnected]);

  const handleSuggestNotes = () => {
    if (!hasValidKey) {
      feedback.error('Vui lòng cấu hình OpenAI API key trong Settings');
      return;
    }

    if (!isConnected) {
      feedback.error('Không thể kết nối đến Anki. Vui lòng kiểm tra AnkiConnect');
      return;
    }

    // Nếu prompt trống, sử dụng prompt ngẫu nhiên
    let finalPrompt = prompt.trim();
    if (!finalPrompt) {
      finalPrompt = getRandomPrompt();
      setPrompt(finalPrompt); // Cập nhật input để user thấy prompt được chọn
      feedback.info(`🎲 Đã chọn prompt ngẫu nhiên: "${finalPrompt.substring(0, 50)}..."`, { duration: 3000 });
    } else {
      feedback.info('Đang tạo thẻ học từ nội dung của bạn...', { duration: 2000 });
    }

    suggestNotesMutation.mutate(finalPrompt);
  };

  const handleNoteTrash = (key: string) => {
    actions.trashNote(key);
    feedback.info('Đã xóa thẻ');
  };

  const handleNoteCreate = async (key: string) => {
    const note = pendingNotes.find(n => n.key === key);
    if (!note) return;

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
      actions.createNote(key);
    } catch (error) {
      console.error('Error creating card:', error);
    }
  };

  const aiLoading = suggestNotesMutation.isLoading;
  const aiError = suggestNotesMutation.error;

  return (
    <Container maxWidth="lg">
      <Grid container sx={{ padding: '25px', maxWidth: 1200 }} spacing={4} justifyContent="flex-start" direction="column">
        {/* Error Alerts */}
        {ankiError && (
          <Alert severity="error" sx={{ marginTop: '20px', marginLeft: '25px' }}>
            {ERROR_MESSAGES.ANKI_CONNECTION}
          </Alert>
        )}

        {aiError && (
          <Alert severity="error" sx={{ marginTop: '20px', marginLeft: '25px' }}>
            {ERROR_MESSAGES.OPENAI_API}
          </Alert>
        )}

        {!hasValidKey && (
          <Alert severity="warning" sx={{ marginTop: '20px', marginLeft: '25px' }}>
            {ERROR_MESSAGES.OPENAI_KEY_MISSING}
          </Alert>
        )}

        {/* Form Section */}
        <Grid container item direction="column" spacing={2} justifyContent="flex-start">
          {ankiLoading ? (
            <FormSkeleton />
          ) : (
            <>
              <DeckSelector
                value={deckName}
                onChange={setDeckName}
                decks={decks}
                disabled={!isConnected}
              />

              <TagSelector
                value={currentTags}
                onChange={setCurrentTags}
                disabled={!isConnected}
              />              <PromptInput
                value={prompt}
                onChange={setPrompt}
                disabled={!hasValidKey || !isConnected || aiLoading}
                placeholder="Nhập prompt của bạn hoặc để trống để AI tự tạo prompt ngẫu nhiên..."
              />

              <Button
                variant="contained"
                onClick={handleSuggestNotes}
                disabled={!hasValidKey || !isConnected || aiLoading}
                sx={{ width: 'fit-content' }}
              >
                {aiLoading ? 'Đang tạo...' : (prompt.trim() ? 'Tạo thẻ từ prompt' : '🎲 Tạo thẻ ngẫu nhiên')}
              </Button>
            </>
          )}
        </Grid>

        {/* Loading Indicator */}
        {aiLoading && (
          <Grid container item justifyContent="center">
            <CircularProgress />
          </Grid>
        )}

        {/* Notes Grid */}
        <Grid container item spacing={2} alignItems="stretch">
          {aiLoading
            ? // Show skeleton cards while loading
            Array.from({ length: 2 }).map((_, index) => (
              <NoteCardSkeleton key={`skeleton-${index}`} />
            ))
            : // Show actual notes
            pendingNotes.filter(note => !note.trashed).map((note) => (
              <NoteCard
                key={note.key}
                note={note}
                onTrash={() => handleNoteTrash(note.key)}
                onCreate={() => handleNoteCreate(note.key)}
              />
            ))}
        </Grid>

        {/* Enhanced Feedback System */}
        <FeedbackSystem
          messages={feedback.messages}
          onDismiss={feedback.dismissMessage}
          position="top-right"
          maxVisible={3}
        />
      </Grid>
    </Container>
  );
}

export default AppSimple;
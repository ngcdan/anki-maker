import {
  Alert, Button, CircularProgress, Grid, Link as MuiLink, Box
} from '@mui/material';

import { useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { NoteCard, DeckSelector, TagSelector, PromptInput, NoteCardSkeleton, FormSkeleton, SettingsFab } from '../../components';
import { getRandomPrompt } from '../../utils/samplePrompts';
import { useAnkiConnection, useOpenAI, useNoteManagement, useOpenAIKey, useErrorHandler } from '../../hooks';
import { ERROR_MESSAGES, DEFAULT_SETTINGS, SUCCESS_MESSAGES } from '../../constants';
import { SuggestOptions } from '../../types';
import useLocalStorage from '../../useLocalStorage';

function App() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const promptParam = query.get('prompt') || '';

  // Local state
  const [prompt, setPrompt] = useState(promptParam);
  const [deckName, setDeckName] = useLocalStorage<string>('deckName', DEFAULT_SETTINGS.deckName);
  const [currentTags, setCurrentTags] = useLocalStorage<string[]>('tags', DEFAULT_SETTINGS.tags);

  // Hooks
  const { isConnected, isLoading: ankiLoading, hasError: ankiError, decks } = useAnkiConnection();
  const { hasValidKey } = useOpenAIKey();
  const { suggestNotes, isLoading: aiLoading, error: aiError } = useOpenAI();
  const { pendingNotes, actions } = useNoteManagement();
  const { handleError, handleSuccess } = useErrorHandler();

  const modelName = DEFAULT_SETTINGS.modelName;

  // Auto-suggest on initial prompt
  useEffect(() => {
    if (promptParam.trim() !== '' && hasValidKey && isConnected) {
      handleSuggestNotes();
    }
  }, [promptParam, hasValidKey, isConnected]);

  const handleSuggestNotes = () => {
    // Nếu prompt trống, sử dụng prompt ngẫu nhiên
    let finalPrompt = prompt.trim();
    if (!finalPrompt) {
      finalPrompt = getRandomPrompt();
      setPrompt(finalPrompt); // Cập nhật input để user thấy prompt được chọn
    }

    const options: SuggestOptions = {
      deckName,
      modelName,
      tags: currentTags,
      prompt: finalPrompt,
    };

    suggestNotes(
      { options, existingNotes: pendingNotes },
      {
        onSuccess: (newNotes) => {
          actions.addNotes(newNotes);
          handleSuccess(`Đã tạo ${newNotes.length} thẻ mới!`);
        },
        onError: (error) => {
          handleError(error, 'suggesting notes');
        },
      }
    );
  };

  const handleNoteTrash = (key: string) => {
    actions.trashNote(key);
    handleSuccess(SUCCESS_MESSAGES.NOTE_TRASHED);
  };

  const handleNoteCreate = (key: string) => {
    actions.createNote(key);
    handleSuccess(SUCCESS_MESSAGES.NOTE_CREATED);
  };

  return (
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
          <Box>
            {ERROR_MESSAGES.OPENAI_KEY_MISSING}
            <br />
            <MuiLink component={Link} to="/settings" sx={{ fontWeight: 'bold', textDecoration: 'underline' }}>
              Nhấn vào đây để cấu hình OpenAI API key
            </MuiLink>
          </Box>
        </Alert>
      )}

      {/* Form Section */}
      <Grid container item direction="column" spacing={2} justifyContent="flex-start">
        {ankiLoading ? (
          <FormSkeleton />
        ) : (
          <>
            <Grid item>
              <DeckSelector
                value={deckName}
                onChange={setDeckName}
                decks={decks}
                isLoading={ankiLoading}
                disabled={!isConnected}
              />
            </Grid>

            <Grid item>
              <TagSelector
                value={currentTags}
                onChange={setCurrentTags}
                isLoading={ankiLoading}
                disabled={!isConnected}
              />
            </Grid>

            <Grid item>
              <PromptInput
                value={prompt}
                onChange={setPrompt}
                disabled={aiLoading}
                placeholder="Nhập prompt của bạn hoặc để trống để AI tự tạo prompt ngẫu nhiên..."
              />
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                color="primary"
                disabled={aiLoading || !hasValidKey || !isConnected}
                onClick={handleSuggestNotes}
              >
                {aiLoading ? 'Đang tạo thẻ...' : (prompt.trim() ? 'Tạo thẻ từ prompt' : '🎲 Tạo thẻ ngẫu nhiên')}
              </Button>
            </Grid>
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
          pendingNotes.map((note) => (
            <NoteCard
              key={note.key}
              note={note}
              onTrash={() => handleNoteTrash(note.key)}
              onCreate={() => handleNoteCreate(note.key)}
            />
          ))}
      </Grid>

      {/* Settings FAB - only show when OpenAI key is missing */}
      <SettingsFab show={!hasValidKey} />
    </Grid>
  );
}

export default App;

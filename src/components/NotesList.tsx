import { Box, Typography, Button, Grid, Paper, CircularProgress } from '@mui/material';
import { ClearAll, Psychology } from '@mui/icons-material';
import NoteCard from './NoteCard';

import { Note } from '../shared';

interface NotesListProps {
  mode: 'light' | 'dark';
  pendingNotes: Note[];
  isLoading: boolean;
  handleClearAll: () => void;
  handleCreateCard: (note: Note) => void;
  handleTrashNote: (noteKey: string) => void;
  handleRestoreNote: (noteKey: string) => void;
  handleDeletePermanent: (noteKey: string) => void;
}

export function NotesList({
  mode,
  pendingNotes,
  isLoading,
  handleClearAll,
  handleCreateCard,
  handleTrashNote,
  handleRestoreNote,
  handleDeletePermanent
}: NotesListProps) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Ghi chú được tạo ({pendingNotes.length})
          </Typography>
          {pendingNotes.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearAll />}
              onClick={handleClearAll}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Xóa tất cả
            </Button>
          )}
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
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
          {pendingNotes.map((note) => (
            <NoteCard
              key={note.key}
              note={note}
              onCreate={() => handleCreateCard(note)}
              onTrash={() => handleTrashNote(note.key)}
              onRestore={() => handleRestoreNote(note.key)}
              onDeletePermanent={() => handleDeletePermanent(note.key)}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
}

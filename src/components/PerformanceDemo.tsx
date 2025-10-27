import { memo, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  NoteCardMemo,
  OptimizedForm,
  LoadingSkeleton,
  CardListSkeleton,
} from '../components';
import {
  usePerformanceMonitor,
  useDebouncedSearch,
  useShallowMemo,
} from '../hooks';
import { Note } from '../types';

interface PerformanceDemoProps {
  notes: Note[];
  onCreateCard: (note: Note) => void;
  onTrashCard: (note: Note) => void;
  onPlayAudio?: (text: string) => void;
  isLoading?: boolean;
}

const PerformanceDemo = memo<PerformanceDemoProps>(({
  notes,
  onCreateCard,
  onTrashCard,
  onPlayAudio,
  isLoading = false,
}) => {
  // Performance monitoring
  usePerformanceMonitor('PerformanceDemo');

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptimized, setShowOptimized] = useState(true);
  const [creatingNotes, setCreatingNotes] = useState<Set<string>>(new Set());

  // Memoized notes with shallow comparison
  const memoizedNotes = useShallowMemo(notes);

  // Debounced search
  const filteredNotes = useDebouncedSearch(
    memoizedNotes,
    searchTerm,
    (note, term) => {
      const searchText = term.toLowerCase();
      return (
        note.fields.Front?.toLowerCase().includes(searchText) ||
        note.fields.Back?.toLowerCase().includes(searchText) ||
        note.fields.Question?.toLowerCase().includes(searchText) ||
        note.fields.Ans?.toLowerCase().includes(searchText) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchText))
      );
    },
    300
  );

  // Memoized handlers
  const handleCreateCard = useCallback(async (note: Note) => {
    setCreatingNotes(prev => new Set(prev).add(note.key));
    try {
      await onCreateCard(note);
    } finally {
      setCreatingNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note.key);
        return newSet;
      });
    }
  }, [onCreateCard]);

  const handleTrashCard = useCallback((note: Note) => {
    onTrashCard(note);
  }, [onTrashCard]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleOptimizedToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setShowOptimized(event.target.checked);
  }, []);

  // Memoized form fields for demo
  const demoFormFields = useMemo(() => [
    {
      key: 'search',
      label: 'Tìm kiếm ghi chú',
      value: searchTerm,
      type: 'text' as const,
    },
  ], [searchTerm]);

  const handleFormFieldChange = useCallback((key: string, value: string) => {
    if (key === 'search') {
      setSearchTerm(value);
    }
  }, []);

  const handleFormSubmit = useCallback(() => {
    // Demo form submit
    console.log('Form submitted with search:', searchTerm);
  }, [searchTerm]);

  // Stats for performance monitoring
  const stats = useMemo(() => ({
    totalNotes: notes.length,
    filteredNotes: filteredNotes.length,
    createdNotes: notes.filter(n => n.created).length,
    trashedNotes: notes.filter(n => n.trashed).length,
  }), [notes, filteredNotes]);

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <LoadingSkeleton type="text" height={40} width="60%" />
        <Box sx={{ mt: 2 }}>
          <CardListSkeleton />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Performance Demo
      </Typography>

      {/* Performance Stats */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Thống kê Performance:
        </Typography>
        <Typography variant="body2">
          Tổng ghi chú: {stats.totalNotes} |
          Đã lọc: {stats.filteredNotes} |
          Đã tạo: {stats.createdNotes} |
          Đã xóa: {stats.trashedNotes}
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showOptimized}
              onChange={handleOptimizedToggle}
            />
          }
          label="Sử dụng components tối ưu hóa"
        />

        <TextField
          fullWidth
          label="Tìm kiếm ghi chú"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mt: 2 }}
          placeholder="Nhập từ khóa để tìm kiếm..."
        />
      </Box>

      {/* Demo Optimized Form */}
      <Box sx={{ mb: 4 }}>
        <OptimizedForm
          title="Form Demo với Optimization"
          fields={demoFormFields}
          onFieldChange={handleFormFieldChange}
          onSubmit={handleFormSubmit}
          submitLabel="Tìm kiếm"
          clearLabel="Xóa"
          onClear={() => setSearchTerm('')}
        />
      </Box>

      {/* Notes List */}
      <Typography variant="h5" gutterBottom>
        Danh sách Ghi chú ({filteredNotes.length})
      </Typography>

      {filteredNotes.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Không có ghi chú nào phù hợp với tìm kiếm.
        </Typography>
      ) : (
        <Box>
          {filteredNotes.map((note) => (
            showOptimized ? (
              <NoteCardMemo
                key={note.key}
                note={note}
                onCreateCard={handleCreateCard}
                onTrashCard={handleTrashCard}
                onPlayAudio={onPlayAudio}
                isCreating={creatingNotes.has(note.key)}
              />
            ) : (
              // Regular component for comparison
              <Box key={note.key} sx={{ mb: 2, p: 2, border: 1, borderColor: 'grey.300' }}>
                <Typography variant="h6">
                  {note.fields.Front || note.fields.Question}
                </Typography>
                <Typography variant="body2">
                  {note.fields.Back || note.fields.Ans}
                </Typography>
              </Box>
            )
          ))}
        </Box>
      )}
    </Container>
  );
});

PerformanceDemo.displayName = 'PerformanceDemo';

export default PerformanceDemo;
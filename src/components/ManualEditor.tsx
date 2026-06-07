import { Box, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { MediaField } from './MediaField';
import { AnkiNoteType, MediaAttachment, MediaType } from '../shared';
import { getFieldsForType } from '../shared/noteTypes';

interface ManualEditorProps {
  noteType: AnkiNoteType;
  fields: Record<string, string>;
  media: Record<string, MediaAttachment>;
  onFieldChange: (name: string, value: string) => void;
  onMediaAdd: (fieldName: string, base64: string, filename: string, type: MediaType) => void;
  onMediaRemove: (fieldName: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ManualEditor({
  noteType,
  fields,
  media,
  onFieldChange,
  onMediaAdd,
  onMediaRemove,
  onSubmit,
  isLoading,
}: ManualEditorProps) {
  const fieldNames = getFieldsForType(noteType);
  const hasContent = fieldNames.some(f => fields[f]?.trim() || media[f]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fieldNames.map(fieldName => (
        <MediaField
          key={fieldName}
          label={fieldName}
          name={fieldName}
          value={fields[fieldName] || ''}
          onChange={onFieldChange}
          onMediaAdd={onMediaAdd}
          onMediaRemove={onMediaRemove}
          mediaPreview={media[fieldName] ? { data: media[fieldName].data, type: media[fieldName].type } : undefined}
          disabled={isLoading}
          rows={4}
        />
      ))}

      <Button
        variant="contained"
        fullWidth
        disabled={!hasContent || isLoading}
        onClick={onSubmit}
        startIcon={isLoading ? <CircularProgress size={16} /> : <Add />}
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 600,
          py: 1,
        }}
      >
        {isLoading ? 'Đang tạo...' : 'Tạo thẻ'}
      </Button>
    </Box>
  );
}

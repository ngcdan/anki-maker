import { Box, Button, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { ImageField } from './ImageField';
import { AnkiNoteType, ImageAttachment } from '../shared';
import { getFieldsForType } from '../shared/noteTypes';

interface ManualEditorProps {
  noteType: AnkiNoteType;
  fields: Record<string, string>;
  images: Record<string, ImageAttachment>;
  onFieldChange: (name: string, value: string) => void;
  onImageAdd: (fieldName: string, base64: string, filename: string) => void;
  onImageRemove: (fieldName: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ManualEditor({
  noteType,
  fields,
  images,
  onFieldChange,
  onImageAdd,
  onImageRemove,
  onSubmit,
  isLoading,
}: ManualEditorProps) {
  const fieldNames = getFieldsForType(noteType);
  const hasContent = fieldNames.some(f => fields[f]?.trim() || images[f]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fieldNames.map(fieldName => (
        <ImageField
          key={fieldName}
          label={fieldName}
          name={fieldName}
          value={fields[fieldName] || ''}
          onChange={onFieldChange}
          onImageAdd={onImageAdd}
          onImageRemove={onImageRemove}
          imagePreview={images[fieldName]?.data}
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

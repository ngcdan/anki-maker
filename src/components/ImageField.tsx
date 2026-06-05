import React, { useRef, useState } from 'react';
import { Box, TextField, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface ImageFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onImageAdd: (name: string, base64: string, filename: string) => void;
  onImageRemove: (name: string) => void;
  imagePreview?: string;
  disabled?: boolean;
  rows?: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageField({
  label,
  name,
  value,
  onChange,
  onImageAdd,
  onImageRemove,
  imagePreview,
  disabled = false,
  rows = 3,
}: ImageFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const base64 = await fileToBase64(file);
    const ext = file.type.split('/')[1] || 'png';
    const filename = `img_${Date.now()}.${ext}`;
    onImageAdd(name, base64, filename);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await handleImage(file);
        return;
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files?.[0]) await handleImage(files[0]);
  };

  return (
    <Box>
      <TextField
        ref={inputRef}
        fullWidth
        label={label}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        multiline
        rows={rows}
        name={name}
        disabled={disabled}
        size="small"
        placeholder="Nhập text hoặc paste ảnh (Ctrl+V)..."
        sx={{
          '& .MuiOutlinedInput-root': {
            borderColor: dragOver ? 'primary.main' : undefined,
            borderWidth: dragOver ? 2 : undefined,
          },
        }}
      />
      {imagePreview && (
        <Box sx={{ mt: 1, position: 'relative', display: 'inline-block' }}>
          <img
            src={`data:image/png;base64,${imagePreview}`}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #e0e0e0' }}
          />
          <IconButton
            size="small"
            onClick={() => onImageRemove(name)}
            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}
      {!imagePreview && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Paste ảnh (Ctrl+V) hoặc kéo thả vào đây
        </Typography>
      )}
    </Box>
  );
}

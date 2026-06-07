import React, { useRef, useState } from 'react';
import { Box, TextField, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { MediaType } from '../shared';

interface MediaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onMediaAdd: (name: string, base64: string, filename: string, type: MediaType) => void;
  onMediaRemove: (name: string) => void;
  mediaPreview?: { data: string; type: MediaType };
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

function getMediaType(file: File): MediaType | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
}

function extractYouTubeId(text: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function toYouTubeIframe(videoId: string): string {
  return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe></div>`;
}

export function MediaField({
  label,
  name,
  value,
  onChange,
  onMediaAdd,
  onMediaRemove,
  mediaPreview,
  disabled = false,
  rows = 3,
}: MediaFieldProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleFile = async (file: File) => {
    const type = getMediaType(file);
    if (!type) return;
    const base64 = await fileToBase64(file);
    const ext = file.type.split('/')[1] || (type === 'image' ? 'png' : 'mp4');
    const prefix = type === 'image' ? 'img' : 'vid';
    const filename = `${prefix}_${Date.now()}.${ext}`;
    onMediaAdd(name, base64, filename, type);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check for media files first
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/') || item.type.startsWith('video/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) await handleFile(file);
        return;
      }
    }

    // Check for YouTube URL in pasted text
    const text = e.clipboardData?.getData('text/plain')?.trim();
    if (text) {
      const videoId = extractYouTubeId(text);
      if (videoId) {
        e.preventDefault();
        const iframe = toYouTubeIframe(videoId);
        const newValue = value ? `${value}\n${iframe}` : iframe;
        onChange(name, newValue);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files?.[0]) await handleFile(files[0]);
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
        placeholder="Nhập text, paste ảnh hoặc kéo thả video..."
        sx={{
          '& .MuiOutlinedInput-root': {
            borderColor: dragOver ? 'primary.main' : undefined,
            borderWidth: dragOver ? 2 : undefined,
          },
        }}
      />
      {mediaPreview && (
        <Box sx={{ mt: 1, position: 'relative', display: 'inline-block' }}>
          {mediaPreview.type === 'image' ? (
            <img
              src={`data:image/png;base64,${mediaPreview.data}`}
              alt="preview"
              style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #e0e0e0' }}
            />
          ) : (
            <video
              src={`data:video/mp4;base64,${mediaPreview.data}`}
              controls
              style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, border: '1px solid #e0e0e0' }}
            />
          )}
          <IconButton
            size="small"
            onClick={() => onMediaRemove(name)}
            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1 }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      )}
      {!mediaPreview && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Paste ảnh/video (Ctrl+V) hoặc kéo thả vào đây
        </Typography>
      )}
    </Box>
  );
}

/**
 * =====================================================
 * 🖼️ COMPACT ANKI PREVIEW
 * =====================================================
 * Simple preview for Front/Back/Audio/Ans cards
 */

import React from 'react';
import { Box, Typography, Tabs, Tab, Paper, Divider, alpha, useTheme } from '@mui/material';
import { ExtractedSections, StyleConfig } from '../../types/anki';
import { applyAnkiStyling } from '../../services/styling/ankiStyler';

export interface AnkiPreviewProps {
  sections: ExtractedSections;
  styleConfig?: StyleConfig;
  mode?: 'light' | 'dark';
}

/**
 * Simple Anki card preview component
 */
export const AnkiPreview: React.FC<AnkiPreviewProps> = ({
  sections,
  styleConfig,
  mode = 'light'
}) => {
  const theme = useTheme();
  const [previewTab, setPreviewTab] = React.useState(0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
        Preview
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Tab Navigation */}
      <Tabs
        value={previewTab}
        onChange={(_, newValue) => setPreviewTab(newValue as number)}
        sx={{ mb: 2 }}
      >
        <Tab label="Front" />
        <Tab label="Back" />
        <Tab label="Audio" />
        <Tab label="Answer" />
      </Tabs>

      {/* Preview Content */}
      <Box sx={{ mt: 2 }}>
        {previewTab === 0 && (
          <PreviewContent
            content={sections.front}
            styleConfig={styleConfig}
            mode={mode}
          />
        )}
        {previewTab === 1 && (
          <PreviewContent
            content={sections.back}
            styleConfig={styleConfig}
            mode={mode}
          />
        )}
        {previewTab === 2 && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.50',
              border: `1px solid ${mode === 'dark' ? 'grey.700' : 'grey.200'}`,
              fontFamily: 'monospace',
              fontSize: '0.9em',
              whiteSpace: 'pre-wrap'
            }}
          >
            {sections.audio}
          </Box>
        )}
        {previewTab === 3 && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              backgroundColor: 'success.light',
              color: 'success.contrastText',
              fontWeight: 600
            }}
          >
            {sections.ans}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

/**
 * Preview content with styling
 */
interface PreviewContentProps {
  content: string;
  styleConfig?: StyleConfig;
  mode: 'light' | 'dark';
}

const PreviewContent: React.FC<PreviewContentProps> = ({
  content,
  styleConfig,
  mode
}) => {
  const styledContent = styleConfig ? applyAnkiStyling(content, styleConfig) : content;

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        backgroundColor: mode === 'dark' ? 'grey.800' : 'grey.50',
        border: `1px solid ${mode === 'dark' ? 'grey.700' : 'grey.200'}`,
        '& .anki-card': {
          maxWidth: '100%',
          margin: 0
        }
      }}
      dangerouslySetInnerHTML={{ __html: styledContent }}
    />
  );
};
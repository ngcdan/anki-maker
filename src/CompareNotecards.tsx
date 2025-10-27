import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Tabs,
  Tab,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import { Note } from './types';
import { NoteCard } from './components/NoteCard/NoteCard';
import EnhancedNoteCardV2 from './components/EnhancedNoteCardV2';

// Sample notes for testing
const sampleNotes: Note[] = [
  {
    key: '1',
    modelName: 'Basic',
    deckName: 'Tiếng Anh',
    fields: {
      Front: '**Apple** là gì?',
      Back: 'Apple là **quả táo** trong tiếng Việt.\n\n- Màu đỏ hoặc xanh\n- Có vị ngọt\n- Giàu vitamin C',
      Question: '',
      Ans: '',
      Audio: 'Apple',
    },
    tags: ['vocabulary', 'fruits'],
    trashed: false,
    created: false,
  },
  {
    key: '2',
    modelName: 'Basic',
    deckName: 'Toán học',
    fields: {
      Front: '',
      Back: '',
      Question: 'Công thức tính diện tích hình tròn?',
      Ans: 'Diện tích hình tròn = π × r²\n\nTrong đó:\n- π ≈ 3.14159\n- r là bán kính',
    },
    tags: ['math', 'geometry'],
    trashed: false,
    created: false,
  },
  {
    key: '3',
    modelName: 'Cloze',
    deckName: 'Lịch sử',
    fields: {
      Front: 'Chiến tranh thế giới thứ {{c1::hai}} kết thúc vào năm {{c2::1945}}.',
      Back: 'Chiến tranh thế giới thứ **hai** là cuộc xung đột toàn cầu lớn nhất trong lịch sử nhân loại.',
      Question: '',
      Ans: '',
    },
    tags: ['history', 'war'],
    trashed: false,
    created: false,
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CompareNotecards() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const mockHandlers = {
    onCreate: () => console.log('Create note'),
    onTrash: () => console.log('Trash note'),
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
        So sánh Note Cards
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        So sánh giữa Original NoteCard và Enhanced NoteCard V2 mới
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Original NoteCard" />
          <Tab label="Enhanced NoteCard V2" />
          <Tab label="Side by Side" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Original NoteCard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Component gốc với functionality cơ bản, layout đơn giản
        </Typography>

        <Grid container spacing={3}>
          {sampleNotes.map((note) => (
            <NoteCard
              key={note.key}
              note={note}
              onCreate={mockHandlers.onCreate}
              onTrash={mockHandlers.onTrash}
            />
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Enhanced NoteCard V2
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Component mới với preview mode, enhanced UI, copy/audio features
        </Typography>

        <Grid container spacing={3}>
          {sampleNotes.map((note) => (
            <EnhancedNoteCardV2
              key={note.key}
              note={note}
              onCreate={mockHandlers.onCreate}
              onTrash={mockHandlers.onTrash}
            />
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Side by Side Comparison
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                🔸 Original NoteCard
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <NoteCard
                  note={sampleNotes[0]}
                  onCreate={mockHandlers.onCreate}
                  onTrash={mockHandlers.onTrash}
                />
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                ✨ Enhanced NoteCard V2
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <EnhancedNoteCardV2
                  note={sampleNotes[0]}
                  onCreate={mockHandlers.onCreate}
                  onTrash={mockHandlers.onTrash}
                />
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            ✨ Tính năng mới trong Enhanced V2:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[
              '🔍 Preview mode với markdown rendering',
              '📋 Copy button cho từng field',
              '🔊 Play audio cho text',
              '🎨 Enhanced UI với animations',
              '📱 Responsive design tốt hơn',
              '🏷️ Status indicators đẹp',
              '⚡ Loading states chi tiết',
              '🎯 Better UX với tooltips',
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2,
                    backgroundColor: 'primary.50',
                    border: '1px solid',
                    borderColor: 'primary.200',
                  }}
                >
                  <Typography variant="body2" color="primary.dark">
                    {feature}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </TabPanel>
    </Container>
  );
}
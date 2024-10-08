import {
  Alert, Autocomplete, Button, Card, CardActions, CardContent,
  CircularProgress, FormControl, Grid, InputLabel, MenuItem, Select, TextField
} from '@mui/material';

import { marked } from 'marked'

import { useLocation } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query'
import { useContext, useState, useEffect } from 'react';

import { addNote, fetchDecks, fetchTags } from './anki';
import { suggestAnkiNotes } from './openai';
import { OpenAIKeyContext } from './OpenAIKeyContext';
import useLocalStorage from './useLocalStorage';

interface Note {
  modelName: string;
  deckName: string;
  fields: { Front: string, Back: string, Question: string, Ans: string, Audio?: string[] };
  tags: string[];
  key: string;
  trashed?: boolean;
  created?: boolean;
}

interface CardProps {
  note: Note;
  onTrash: () => void;
  onCreate: () => void;
}

const NoteComponent: React.FC<CardProps> = ({ note, onTrash, onCreate }) => {

  const [currentNote, setCurrentNote] = useState(note);

  const { modelName, deckName, fields, tags, trashed, created } = currentNote;

  const handleFieldChange = (event: React.ChangeEvent<{ name: string, value: string }>) => {
    if (event.target.name) {
      setCurrentNote(prev => ({
        ...prev,
        fields: { ...prev.fields, [event.target.name]: event.target.value }
      }));
    }
  };

  const handleTagsChange = (_: any, tags: string[]) => {
    setCurrentNote(prev => ({
      ...prev,
      tags
    }));
  };

  const { isLoading, mutate } = useMutation({
    mutationFn: addNote,
    onSuccess: (_) => onCreate()
  })

  const { data: allTags } = useQuery({
    queryFn: fetchTags,
    queryKey: ["tags"]
  });

  const onAddNote = async () => {
    try {
      let audioTexts: any = currentNote.fields.Audio || []
      let fields = currentNote.fields
      let updateFields = {
        ...fields,
        Front: marked.parse(fields.Front),
        Back: marked.parse(fields.Back),
      }

      let migrateNote: any = { ...currentNote, fields: updateFields }
      if (audioTexts.length > 0) {
        const response: any = await fetch('http://localhost:3000/dev/chatbot/tts/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({
            text: audioTexts[0], download: true,
            dir: `/Users/linuss/Dev/resources/anki`
          }),
        });

        const responseData = await response.json();
        migrateNote['audio'] = [
          {
            "path": responseData['filePath'],
            "filename": responseData['fileName'],
            "skipHash": "7e2c2f954ef6051373ba916f000168dc",
            "fields": [
              "Front"
            ]
          }
        ]
      }
      return mutate(migrateNote)
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  return !trashed && !created && (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="Deck" value={deckName} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Note type" value={modelName} disabled />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete id="tags" multiple autoHighlight freeSolo
                value={tags} options={allTags || []} onChange={handleTagsChange}
                renderInput={(params) => <TextField label="Tags" {...params} />} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Front" defaultValue={fields.Front} multiline name="Front"
                onChange={handleFieldChange} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Question" defaultValue={fields.Question} multiline name="Question"
                onChange={handleFieldChange} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Answer" defaultValue={fields.Ans} multiline name="Ans"
                onChange={handleFieldChange} />
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Back" defaultValue={fields.Back} multiline name="Back"
                onChange={handleFieldChange} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button size="small" color="secondary" onClick={() => onTrash()}>
            Trash
          </Button>
          <Button size="small" color="primary" onClick={() => onAddNote()} disabled={isLoading} >
            Add note
          </Button>
        </CardActions>
      </Card>
    </Grid >
  );
};

interface Options {
  deckName: string;
  modelName: string;
  prompt: string;
  tags: string[];
}

function Home() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);

  const promptParam = query.get('prompt') || "";

  const [decks, setDecks] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [deckName, setDeckName] = useLocalStorage("deckName", "CS");
  const [currentTags, setCurrentTags] = useLocalStorage<string[]>("tags", []);
  const [prompt, setPrompt] = useState(promptParam);

  const modelName = "Basic_cloze";

  const { openAIKey } = useContext(OpenAIKeyContext);

  // State for managing suggestion process
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestError, setSuggestError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [decksData, tagsData] = await Promise.all([fetchDecks(), fetchTags()]);
        setDecks(decksData);
        setTags(tagsData);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to suggest notes using OpenAI
  const suggestNotes = async (options: Options) => {
    setIsSuggesting(true);
    setSuggestError(null);
    try {
      const newNotes = await suggestAnkiNotes(openAIKey, options, notes);
      setNotes((prevNotes) => [...prevNotes, ...newNotes]);
    } catch (error) {
      setSuggestError(error as Error);
    } finally {
      setIsSuggesting(false);
    }
  };


  // If there's an initial prompt param, trigger suggestion
  useEffect(() => {
    if (promptParam.trim() !== "") {
      suggestNotes({ deckName, modelName, tags: currentTags, prompt: promptParam });
    }
  }, [promptParam])

  return (
    <Grid container sx={{ padding: "25px", maxWidth: 1200 }} spacing={4} justifyContent="flex-start" direction="column" >
      {error ?
        <Alert severity="error" sx={{ marginTop: "20px", marginLeft: "25px" }}>
          Error: We can't connect to Anki using AnkiConnect.
          Please make sure Anki is running and you have the AnkiConnect plugin enabled, and that you have set the CORS settings.
        </Alert>
        : <></>}
      {suggestError ?
        <Alert severity="error" sx={{ marginTop: "20px", marginLeft: "25px" }}>
          Error: We can't connect to OpenAI. Ensure you have entered your OpenAI key correctly.
        </Alert>
        : <></>}

      <Grid container item direction="column" spacing={2} justifyContent="flex-start">
        <Grid item>
          <FormControl fullWidth>
            <InputLabel id="deck-label">Deck</InputLabel>
            <Select labelId="deck-label" label="Deck" id="deck" value={deckName}
              onChange={e => { e.target.value && setDeckName(e.target.value) }} >
              {decks && decks.map(deckName =>
                <MenuItem key={"deck" + deckName} value={deckName}>{deckName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl fullWidth>
            <Autocomplete id="tags" multiple autoHighlight value={currentTags} options={tags || []}
              onChange={(_, value) => { value && setCurrentTags(value) }} freeSolo
              renderInput={(params) => <TextField label="Tags" {...params} />} />
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <TextField id="prompt" label="Prompt" maxRows={10} multiline value={prompt}
              onChange={e => setPrompt(e.target.value)} />
          </FormControl>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" disabled={isSuggesting}
            onClick={() => suggestNotes({ deckName, modelName, tags: currentTags, prompt })}>
            Suggest cards
          </Button>
        </Grid>
      </Grid>
      <Grid container item>
        {(loading || isSuggesting) && <CircularProgress />}
      </Grid>

      <Grid container item spacing={2} alignItems="stretch">
        {notes
          .filter(n => !n.trashed)
          .filter(n => !n.created)
          .map((note) =>
            <NoteComponent key={note.key} note={note}
              onTrash={() => {
                setNotes(notes => notes.map((n) => note.key === n.key ? { ...n, trashed: true } : n))
              }}
              onCreate={() => {
                setNotes(notes => notes.map((n) => note.key === n.key ? { ...n, created: true } : n))
              }}
            />
          )}
      </Grid>
    </Grid >
  );
}

export default Home

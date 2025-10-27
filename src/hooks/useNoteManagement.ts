import { useState, useCallback } from 'react';
import { Note } from '../types';

export const useNoteManagement = (initialNotes: Note[] = []) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const addNotes = useCallback((newNotes: Note[]) => {
    setNotes(prevNotes => [...prevNotes, ...newNotes]);
  }, []);

  const updateNote = useCallback((key: string, updates: Partial<Note>) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.key === key ? { ...note, ...updates } : note
      )
    );
  }, []);

  const trashNote = useCallback((key: string) => {
    updateNote(key, { trashed: true });
  }, [updateNote]);

  const createNote = useCallback((key: string) => {
    updateNote(key, { created: true });
  }, [updateNote]);

  const deleteNote = useCallback((key: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.key !== key));
  }, []);

  const clearNotes = useCallback(() => {
    setNotes([]);
  }, []);

  const clearTrashedNotes = useCallback(() => {
    setNotes(prevNotes => prevNotes.filter(note => !note.trashed));
  }, []);

  const clearCreatedNotes = useCallback(() => {
    setNotes(prevNotes => prevNotes.filter(note => !note.created));
  }, []);

  // Computed values
  const pendingNotes = notes.filter(note => !note.trashed && !note.created);
  const trashedNotes = notes.filter(note => note.trashed);
  const createdNotes = notes.filter(note => note.created);

  const stats = {
    total: notes.length,
    pending: pendingNotes.length,
    trashed: trashedNotes.length,
    created: createdNotes.length,
  };

  return {
    notes,
    pendingNotes,
    trashedNotes,
    createdNotes,
    stats,
    actions: {
      addNotes,
      updateNote,
      trashNote,
      createNote,
      deleteNote,
      clearNotes,
      clearTrashedNotes,
      clearCreatedNotes,
    },
  };
};
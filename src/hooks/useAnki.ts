import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../shared';
import { Note } from '../shared';

import { ankiService } from '../services/ankiService';

export const useDecks = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DECKS],
    queryFn: () => ankiService.fetchDecks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error fetching decks:', error);
    },
  });
};

export const useAddNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: Note) => ankiService.addNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.DECKS]);
    },
    onError: (error) => {
      console.error('Error adding note:', error);
    },
  });
};

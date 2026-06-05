import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface DeckSelectorProps {
  value: string;
  onChange: (value: string) => void;
  decks: string[];
  isLoading?: boolean;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  value,
  onChange,
  decks,
  isLoading = false,
}) => {
  const handleChange = (event: any) => {
    if (event.target.value) {
      onChange(event.target.value);
    }
  };

  return (
    <FormControl fullWidth disabled={isLoading}>
      <InputLabel id="deck-label">Deck</InputLabel>
      <Select
        labelId="deck-label"
        label="Deck"
        id="deck"
        value={value}
        onChange={handleChange}
      >
        {decks.map(deckName => (
          <MenuItem key={`deck-${deckName}`} value={deckName}>
            {deckName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
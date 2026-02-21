import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FormComponentProps } from '../shared';

interface DeckSelectorProps extends FormComponentProps {
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
  disabled = false,
  error,
  helperText,
}) => {
  const handleChange = (event: any) => {
    if (event.target.value) {
      onChange(event.target.value);
    }
  };

  return (
    <FormControl fullWidth disabled={disabled || isLoading} error={!!error}>
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
      {helperText && (
        <div style={{ fontSize: '0.75rem', color: error ? 'red' : 'gray', marginTop: '4px' }}>
          {helperText}
        </div>
      )}
    </FormControl>
  );
};
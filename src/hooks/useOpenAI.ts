import { useContext } from 'react';
import { OpenAIKeyContext } from '../contexts/OpenAIKeyContext';

export const useOpenAIKey = () => {
  const { openAIKey, setOpenAIKey } = useContext(OpenAIKeyContext);

  const isValidKey = (key: string): boolean => {
    return key.startsWith('sk-') && key.length > 20;
  };

  return {
    openAIKey,
    setOpenAIKey,
    hasValidKey: isValidKey(openAIKey),
    isValidKey,
  };
};
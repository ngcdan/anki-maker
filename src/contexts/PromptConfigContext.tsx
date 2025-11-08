import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PromptConfig, getDefaultConfig, getConfigById, ALL_PROMPT_CONFIGS } from '../config/promptConfigs';

interface PromptConfigContextType {
  currentConfig: PromptConfig;
  setConfigById: (id: string) => void;
  availableConfigs: PromptConfig[];
  isLoading: boolean;
}

const PromptConfigContext = createContext<PromptConfigContextType | undefined>(undefined);

interface PromptConfigProviderProps {
  children: ReactNode;
}

export const PromptConfigProvider: React.FC<PromptConfigProviderProps> = ({ children }) => {
  const [currentConfig, setCurrentConfig] = useState<PromptConfig>(getDefaultConfig());
  const [isLoading, setIsLoading] = useState(false);

  // Load saved config from localStorage on mount
  useEffect(() => {
    const savedConfigId = localStorage.getItem('anki-maker-prompt-config');
    if (savedConfigId) {
      const config = getConfigById(savedConfigId);
      if (config) {
        setCurrentConfig(config);
      }
    }
  }, []);

  const setConfigById = (id: string) => {
    setIsLoading(true);
    const config = getConfigById(id);
    if (config) {
      setCurrentConfig(config);
      localStorage.setItem('anki-maker-prompt-config', id);
    }
    setIsLoading(false);
  };

  // Import all available configs
  const availableConfigs = React.useMemo(() => {
    return ALL_PROMPT_CONFIGS;
  }, []);

  const value: PromptConfigContextType = {
    currentConfig,
    setConfigById,
    availableConfigs,
    isLoading
  };

  return (
    <PromptConfigContext.Provider value={value}>
      {children}
    </PromptConfigContext.Provider>
  );
};

export const usePromptConfig = (): PromptConfigContextType => {
  const context = useContext(PromptConfigContext);
  if (context === undefined) {
    throw new Error('usePromptConfig must be used within a PromptConfigProvider');
  }
  return context;
};
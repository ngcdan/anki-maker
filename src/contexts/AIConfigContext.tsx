// AI Configuration Context for user preferences
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AI_CONFIG } from '../constants/aiConfig';

interface AIConfigContextType {
  // Model preference
  preferredModel: 'TURBO' | 'MINI' | 'GPT4' | 'AUTO';
  setPreferredModel: (model: 'TURBO' | 'MINI' | 'GPT4' | 'AUTO') => void;

  // Performance settings
  enableCaching: boolean;
  setEnableCaching: (enabled: boolean) => void;

  enableStreaming: boolean;
  setEnableStreaming: (enabled: boolean) => void;

  // Prompt optimization
  useOptimizedPrompts: boolean;
  setUseOptimizedPrompts: (enabled: boolean) => void;

  // Performance monitoring
  enablePerformanceLogging: boolean;
  setEnablePerformanceLogging: (enabled: boolean) => void;

  // Cache settings
  cacheSettings: {
    ttl: number; // Time to live in ms
    maxSize: number; // Max cached items
  };
  setCacheSettings: (settings: { ttl: number; maxSize: number }) => void;
}

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined);

export const useAIConfig = () => {
  const context = useContext(AIConfigContext);
  if (!context) {
    throw new Error('useAIConfig must be used within AIConfigProvider');
  }
  return context;
};

export const AIConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or use defaults
  const [preferredModel, setPreferredModel] = useState<'TURBO' | 'MINI' | 'GPT4' | 'AUTO'>(() => {
    return (localStorage.getItem('ai-preferred-model') as any) || 'AUTO';
  });

  const [enableCaching, setEnableCaching] = useState(() => {
    const saved = localStorage.getItem('ai-enable-caching');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [enableStreaming, setEnableStreaming] = useState(() => {
    const saved = localStorage.getItem('ai-enable-streaming');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [useOptimizedPrompts, setUseOptimizedPrompts] = useState(() => {
    const saved = localStorage.getItem('ai-use-optimized-prompts');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [enablePerformanceLogging, setEnablePerformanceLogging] = useState(() => {
    const saved = localStorage.getItem('ai-enable-performance-logging');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [cacheSettings, setCacheSettings] = useState(() => {
    const saved = localStorage.getItem('ai-cache-settings');
    return saved ? JSON.parse(saved) : {
      ttl: AI_CONFIG.cache.ttl,
      maxSize: AI_CONFIG.cache.maxSize
    };
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('ai-preferred-model', preferredModel);
  }, [preferredModel]);

  useEffect(() => {
    localStorage.setItem('ai-enable-caching', JSON.stringify(enableCaching));
  }, [enableCaching]);

  useEffect(() => {
    localStorage.setItem('ai-enable-streaming', JSON.stringify(enableStreaming));
  }, [enableStreaming]);

  useEffect(() => {
    localStorage.setItem('ai-use-optimized-prompts', JSON.stringify(useOptimizedPrompts));
  }, [useOptimizedPrompts]);

  useEffect(() => {
    localStorage.setItem('ai-enable-performance-logging', JSON.stringify(enablePerformanceLogging));
  }, [enablePerformanceLogging]);

  useEffect(() => {
    localStorage.setItem('ai-cache-settings', JSON.stringify(cacheSettings));
  }, [cacheSettings]);

  return (
    <AIConfigContext.Provider
      value={{
        preferredModel,
        setPreferredModel,
        enableCaching,
        setEnableCaching,
        enableStreaming,
        setEnableStreaming,
        useOptimizedPrompts,
        setUseOptimizedPrompts,
        enablePerformanceLogging,
        setEnablePerformanceLogging,
        cacheSettings,
        setCacheSettings,
      }}
    >
      {children}
    </AIConfigContext.Provider>
  );
};
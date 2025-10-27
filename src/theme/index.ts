export { ThemeProvider, useAppTheme } from './ThemeProvider';

// Re-export Material-UI theme utilities for convenience
export { useTheme } from '@mui/material/styles';
export type { Theme } from '@mui/material/styles';

// Custom theme utilities
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
} as const;

export const animations = {
  hover: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;
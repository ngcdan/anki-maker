export { ThemeProvider, useAppTheme } from './ThemeProvider';

// Re-export Material-UI theme utilities for convenience
export { useTheme } from '@mui/material/styles';
export type { Theme } from '@mui/material/styles';

export const gradients = {
  primary: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
} as const;
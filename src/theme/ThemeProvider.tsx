import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline, useMediaQuery } from '@mui/material';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define color palette
const lightPalette = {
  primary: {
    main: '#2563eb', // Modern blue
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#7c3aed', // Purple accent
    light: '#8b5cf6',
    dark: '#6d28d9',
    contrastText: '#ffffff',
  },
  success: {
    main: '#10b981', // Green
    light: '#34d399',
    dark: '#059669',
  },
  warning: {
    main: '#f59e0b', // Amber
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444', // Red
    light: '#f87171',
    dark: '#dc2626',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    paperElevated: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
  },
  divider: '#e5e7eb',
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};

const darkPalette = {
  primary: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#a855f7',
    light: '#c084fc',
    dark: '#9333ea',
    contrastText: '#ffffff',
  },
  success: {
    main: '#22c55e',
    light: '#4ade80',
    dark: '#16a34a',
  },
  warning: {
    main: '#eab308',
    light: '#facc15',
    dark: '#ca8a04',
  },
  error: {
    main: '#f87171',
    light: '#fca5a5',
    dark: '#ef4444',
  },
  background: {
    default: '#0f172a',
    paper: '#1e293b',
    paperElevated: '#334155',
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    disabled: '#64748b',
  },
  divider: '#334155',
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

// Typography configuration
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.025em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    color: 'text.secondary',
  },
  button: {
    fontWeight: 500,
    textTransform: 'none' as const,
    letterSpacing: '0.025em',
  },
};

// Component overrides
const getComponentOverrides = (mode: 'light' | 'dark') => ({
  MuiCssBaseline: {
    styleOverrides: {
      html: {
        scrollBehavior: 'smooth',
      },
      body: {
        scrollbarWidth: 'thin',
        scrollbarColor: mode === 'dark' ? '#475569 #1e293b' : '#cbd5e1 #f1f5f9',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: mode === 'dark' ? '#1e293b' : '#f1f5f9',
        },
        '&::-webkit-scrollbar-thumb': {
          background: mode === 'dark' ? '#475569' : '#cbd5e1',
          borderRadius: '4px',
          '&:hover': {
            background: mode === 'dark' ? '#64748b' : '#94a3b8',
          },
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: mode === 'dark'
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        padding: '8px 16px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        '&:hover': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&.Mui-focused': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backdropFilter: 'blur(20px)',
        backgroundColor: mode === 'dark'
          ? 'rgba(15, 23, 42, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        borderBottom: `1px solid ${mode === 'dark' ? '#334155' : '#e2e8f0'}`,
      },
    },
  },
} as const);

// Theme creation function
const createAppTheme = (mode: 'light' | 'dark') => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? lightPalette : darkPalette),
    },
    typography,
    components: getComponentOverrides(mode),
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
  });
};

// Theme context
interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Custom hook to use theme
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Auto-detect system preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Get saved theme or use system preference
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return prefersDarkMode ? 'dark' : 'light';
  });

  // Save theme preference
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const theme = createAppTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';
type ChartType = 'line' | 'bar' | 'area';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeContextProvider');
  }
  return context;
};

interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showGrid, setShowGrid] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const toggleGrid = () => setShowGrid((prev) => !prev);
  const toggleAnimations = () => setAnimationsEnabled((prev) => !prev);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#ffffff' : '#000000',
            light: mode === 'dark' ? '#f5f5f5' : '#333333',
            dark: mode === 'dark' ? '#cccccc' : '#000000',
          },
          secondary: {
            main: mode === 'dark' ? '#666666' : '#999999',
            light: mode === 'dark' ? '#888888' : '#bbbbbb',
            dark: mode === 'dark' ? '#444444' : '#777777',
          },
          background: {
            default: mode === 'dark' ? '#000000' : '#ffffff',
            paper: mode === 'dark' ? '#0a0a0a' : '#fafafa',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000',
            secondary: mode === 'dark' ? '#999999' : '#666666',
          },
          divider: mode === 'dark' ? '#1a1a1a' : '#e0e0e0',
          success: {
            main: mode === 'dark' ? '#4ade80' : '#22c55e',
          },
          error: {
            main: mode === 'dark' ? '#f87171' : '#ef4444',
          },
          warning: {
            main: mode === 'dark' ? '#fbbf24' : '#f59e0b',
          },
          info: {
            main: mode === 'dark' ? '#60a5fa' : '#3b82f6',
          },
        },
        typography: {
          fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
          h1: { 
            fontWeight: 700, 
            fontSize: '2.5rem',
            letterSpacing: '-0.02em',
          },
          h2: { 
            fontWeight: 700, 
            fontSize: '2rem',
            letterSpacing: '-0.01em',
          },
          h3: { 
            fontWeight: 600, 
            fontSize: '1.75rem',
          },
          h4: { 
            fontWeight: 600, 
            fontSize: '1.5rem',
          },
          h5: { 
            fontWeight: 600, 
            fontSize: '1.25rem',
          },
          h6: { 
            fontWeight: 600, 
            fontSize: '1rem',
          },
          body1: {
            fontSize: '0.95rem',
            lineHeight: 1.6,
          },
          body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === 'dark' ? '#000000' : '#ffffff',
                scrollbarColor: mode === 'dark' ? '#333333 #000000' : '#cccccc #ffffff',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: mode === 'dark' ? '#000000' : '#ffffff',
                },
                '&::-webkit-scrollbar-thumb': {
                  borderRadius: 8,
                  backgroundColor: mode === 'dark' ? '#333333' : '#cccccc',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? '#444444' : '#999999',
                  },
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backgroundColor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
                padding: '8px 16px',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#0a0a0a' : '#fafafa',
                border: `1px solid ${mode === 'dark' ? '#1a1a1a' : '#e0e0e0'}`,
                boxShadow: 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 500,
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = {
    mode,
    toggleTheme,
    chartType,
    setChartType,
    showGrid,
    toggleGrid,
    animationsEnabled,
    toggleAnimations,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

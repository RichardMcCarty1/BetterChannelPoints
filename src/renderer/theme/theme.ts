import { createTheme } from '@mui/material';

export const themeOptions = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1d1d20',
      light: '#5e5962',
      dark: '#000000',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

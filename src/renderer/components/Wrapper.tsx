import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import HttpIcon from '@mui/icons-material/Http';
import { ArrowBack } from '@mui/icons-material';
import React, { ReactElement } from 'react';
import { ThemeProvider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { themeOptions } from '../theme/theme';

const drawerWidth = 240;

interface WrapperProps {
  children: JSX.Element | null,
  tab:  React.Dispatch<React.SetStateAction<string>>
}

export const Wrapper = ({ children, tab }: WrapperProps ): ReactElement => {
  const navigate = useNavigate();

  const backFunction = () => {
    navigate('/');
  };

  return (
    <ThemeProvider theme={themeOptions}>
      <div style={{ width: '100%', height: '100%' }}>
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <CssBaseline />
          <AppBar position="fixed" sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            '& .MuiToolbar-root': {
              backgroundColor: '#18181B'
            }
          }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                <IconButton onClick={backFunction}>
                  <ArrowBack style={{ color: '#fff' }} />
                </IconButton>
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1F1F23' }
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                <ListItem key="Audio" disablePadding>
                  <ListItemButton onClick={() => tab('audio')}>
                    <ListItemIcon>
                      <LibraryMusicIcon />
                    </ListItemIcon>
                    <ListItemText primary="Audio" />
                  </ListItemButton>
                </ListItem>
                <ListItem key="HTTP Wrapper" disablePadding>
                  <ListItemButton onClick={() => tab('http')}>
                    <ListItemIcon>
                      <HttpIcon />
                    </ListItemIcon>
                    <ListItemText primary="HTTP Wrapper" />
                  </ListItemButton>
                </ListItem>
              </List>
              <Divider />
            </Box>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto', paddingTop: '5%' }}>
            {children}
          </Box>
        </Box>
      </div>
    </ThemeProvider>
  );
};

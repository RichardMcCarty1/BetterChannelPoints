import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import Button from '@mui/material/Button';
import icon from '../../../assets/icon.svg';
import { themeOptions } from '../theme/theme';

const Hello = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    window.electron.ipcRenderer.on('oauth-implicit', (token) => {
      navigate('/dashboard', { replace: false, state: { 'token': token }})
    });
  });

  const buttonPlaySound = () => {
    window.electron.ipcRenderer.sendMessage('oauth-implicit', ['open']);
    // navigate('/dashboard');
  };

  return (
    <ThemeProvider theme={themeOptions}>
      <div style={{ width: '100%', height: '100%' }}>
        <div className="Hello">
          <img width="200px" alt="icon" src={icon} />
          <h1
            style={{
              fontFamily:
                'Inter,Roobert,Helvetica Neue,Helvetica,Arial,sans-serif;',
            }}
          >
            BetterChannelPoints
          </h1>
          <Button variant="contained" type="button" onClick={buttonPlaySound}>
            Login
          </Button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Hello;

import React, { ChangeEvent, ReactElement, useState } from 'react';
import Box from '@mui/material/Box';
import { Button, MenuItem, Select, TextField } from '@mui/material';

export const Http = ({ channelRedemptions }): ReactElement => {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState("GET");
  const [data, setData] = useState('');
  const [config, setConfig] = useState('');
  const [channelPointName, setChannelPointName] = useState('');

  const handleEndpoint = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEndpoint(event.target.value)
  }

  const bindOnClick = () => {
    if (endpoint && method && channelPointName) {
      window.electron.ipcRenderer.sendMessage('axiosWrapper', [endpoint, method, data, config, channelPointName]);
    }
  }

  return (
    <Box sx={{
      display: 'block',
      width: '100%',
      height: '100%',
      alignItems: 'flex-start',
      justifyContent: 'center',
      flexDirection: 'row'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', height: '100%', paddingBottom: '15px'}}>
          <div style={{ height: '100%', paddingTop: '15px', width: '75px', textAlign: 'end' }}>
            <h3 style={{ display: 'inline', paddingRight: '10px' }}>
              URL
            </h3>
          </div>
          <TextField
            onChange={handleEndpoint}
            variant="outlined"
            sx={{
            width: '92%'
            }}
          />
        </div>
        <div style={{ display: 'flex', height: '100%', paddingBottom: '15px'}}>
          <div style={{ height: '100%', paddingTop: '15px', width: '75px', textAlign: 'end' }}>
            <h3 style={{ display: 'inline', paddingRight: '10px' }}>
              Method
            </h3>
          </div>
          <Select
            sx={{ width: '92%' }}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
          </Select>
        </div>
        <div style={{ display: 'flex', height: '100%', paddingBottom: '15px'}}>
          <div style={{ height: '100%', paddingTop: '15px', width: '75px', textAlign: 'end' }}>
            <h3 style={{ display: 'inline', paddingRight: '10px' }}>
              Data
            </h3>
          </div>
          <TextField
            onChange={(e) => setData(e.target.value)}
            variant="outlined"
            multiline
            rows={5}
            sx={{
              width: '92%'
            }}
          />
        </div>
        <div style={{ display: 'flex', height: '100%', paddingBottom: '15px'}}>
          <div style={{ height: '100%', paddingTop: '15px', width: '75px', textAlign: 'end' }}>
            <h3 style={{ display: 'inline', paddingRight: '10px' }}>
              Config
            </h3>
          </div>
          <TextField
            onChange={(e) => setConfig(e.target.value)}
            variant="outlined"
            multiline
            rows={5}
            sx={{
              width: '92%'
            }}
          />
        </div>
        <div style={{ display: 'flex', height: '100%', paddingBottom: '15px'}}>
          <div style={{ height: '100%', paddingTop: '15px', width: '75px', textAlign: 'end' }}>
            <h3 style={{ display: 'inline', paddingRight: '10px' }}>
              Channel Point Name
            </h3>
          </div>
          <Select
            sx={{ width: '92%' }}
            value={channelPointName}
            onChange={(e) => setChannelPointName(e.target.value)}
          >
            {channelRedemptions.map((item) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              return <MenuItem value={item.title}>{item.title}</MenuItem>;
            })}
          </Select>
        </div>
        <div style={{ height: '100%', paddingBottom: '15px', marginLeft: '73px', width: '92%' }}>
          <Button style={{ width: '100%' }} variant="contained" onClick={bindOnClick}>
            Bind to Channel Point Redemption
          </Button>
        </div>
      </div>
    </Box>
  );
};

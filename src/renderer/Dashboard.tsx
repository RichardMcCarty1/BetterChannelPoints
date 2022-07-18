import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Collapse, MenuItem } from '@mui/material';
import Button from '@mui/material/Button';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { getChannelRedemptions, getUserId } from './api/getUserId';
import { heartbeat, listen } from './api/generateSocket';
import { Wrapper } from './components/Wrapper';

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState('audio');
  const [channelRedemptions, setRedemptions] = useState([]);
  const [selectedRedemption, setSelectedRedemption] = useState('');
  const [listingVisible, setListingVisible] = useState(false);
  const [mapState, setMapState] = useState((window.electron.store.get('map') ? window.electron.store.get('map') : {}));
  const navigate = useNavigate();
  const location = useLocation();
  const token = (location.state as Record<string, string>).token
  let firstPass = true;
  let ws: WebSocket;

  const selectHandleChange = (event: SelectChangeEvent) => {
    setSelectedRedemption(event.target.value);
  }

  const fileSelection = ()  => {
    window.electron.ipcRenderer.sendMessage('importfile', [selectedRedemption]);

    window.electron.ipcRenderer.once('importfile', () => {
      setMapState(window.electron.store.get('map'));
    })
  }

  const generateSocket = () => {
    const heartbeatTimer = 240000;
    const reconnectTimer = 3000;
    let heartbeatHandle: NodeJS.Timer;

    ws = new WebSocket('wss://pubsub-edge.twitch.tv');

    ws.onopen = () => {
      heartbeat(ws);
      heartbeatHandle = setInterval(() => heartbeat(ws), heartbeatTimer);
    }

    ws.onerror = (error) => {
      // eslint-disable-next-line no-console
      console.log(error);
    }

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if(message.type === 'PONG' && firstPass) {
        listen(`channel-points-channel-v1.${window.electron.store.get('uid')}`, window.electron.store.get('token'), ws);
        firstPass = false;
      }
      if (message.type === 'RECONNECT') {
        setTimeout(generateSocket, reconnectTimer);
      }else if (message.type !== 'PONG' && message.type !== "RESPONSE") {
        const reward = JSON.parse(message.data.message).data.redemption.reward.title;
        window.electron.ipcRenderer.sendMessage('playsound', [reward]);
      }

    }

    ws.onclose = () => {
      clearInterval(heartbeatHandle);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
    }

     getUserId(token).then((response) => {
       // If unauthorized, send back to login to retry auth
       if (response.status === 401) {
         window.electron.store.set('token', null);
         navigate('/');
       } else {
         window.electron.store.set('uid', response.data.data[0].id);
         getChannelRedemptions(token, response.data.data[0].id).then((innerResponse) => {
             setRedemptions(innerResponse.data.data);
             generateSocket();
         })
       }
     });
  }, [navigate]);


  return (
        <Wrapper tab={setCurrentTab}>
          { currentTab === 'audio' ? <Box sx={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: '15px'
          }}>
            <div style={{ paddingBottom: '10px' }}>
              <div style={{ minWidth: '600px', paddingBottom: '20px' }}>
                <Box
                  sx={{
                    display: '-webkit-box',
                    alignItems: 'center',
                    width: 'min-content',
                    minWidth: '600px',
                    border: (theme) => `2px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    justifyContent: 'space-evenly',
                    bgcolor: 'background.paper',
                    color: 'text.secondary',
                    '& svg': {
                      m: 1.5
                    },
                    '& hr': {
                      mx: 0.5
                    }
                  }}
                >
                  <div style={{ display: 'inherit', width: '100%' }}>
                    <p style={{ width: '48%', textAlign: 'center', wordBreak: 'break-word' }}>
                      <b>
                        Redemption Name
                      </b>
                    </p>
                    <Divider orientation="vertical" flexItem />
                    <p style={{ width: '48%', textAlign: 'center', wordBreak: 'break-word' }}>
                      <b>
                        File Route
                      </b>
                      <IconButton sx={{ padding: '0', float: 'right' }}
                                  onClick={() => setListingVisible(!listingVisible)}>
                        {listingVisible ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                      </IconButton>
                    </p>
                  </div>
                </Box>

                <div style={{ display: listingVisible ? 'inherit' : 'none' }}>
                  {
                    Object.entries(mapState).map((val) => {
                      const value = val[1] as string;
                      return (
                        <Collapse in={listingVisible}>
                          <Box
                            sx={{
                              transformOrigin: 'top center',
                              display: '-webkit-box',
                              alignItems: 'center',
                              width: 'min-content',
                              minWidth: '600px',
                              border: (theme) => `2px solid ${theme.palette.divider}`,
                              borderRadius: 1,
                              justifyContent: 'space-evenly',
                              bgcolor: 'background.paper',
                              color: 'text.secondary',
                              '& svg': {
                                m: 1.5
                              },
                              '& hr': {
                                mx: 0.5
                              }
                            }}
                          >

                            <div style={{ display: 'inherit', width: '100%' }}>
                              <p style={{
                                width: '48%',
                                textAlign: 'center',
                                wordBreak: 'break-word',
                                position: 'relative'
                              }}>
                                {val[0]}
                                <IconButton sx={{
                                  padding: '0',
                                  float: 'right',
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  height: 'min-content'
                                }} onClick={() => {
                                  const map = mapState;
                                  delete map[val[0]];
                                  setMapState(map);
                                  window.electron.store.set('map', map);
                                  setListingVisible(false);
                                }}>
                                  <DeleteIcon sx={{ color: 'red' }} />
                                </IconButton>
                              </p>
                              <Divider orientation="vertical" flexItem />
                              <p style={{ width: '48%', textAlign: 'center', wordBreak: 'break-word' }}>{value}</p>
                            </div>
                          </Box>
                        </Collapse>

                      );
                    })}

                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Select sx={{ maxWidth: '600px', width: '600px', height: '82px' }} value={selectedRedemption}
                      onChange={selectHandleChange}>
                {
                  channelRedemptions.map((item) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return <MenuItem value={item.title}>{item.title}</MenuItem>;
                  })
                }
              </Select>
              {selectedRedemption &&
                <div style={{ display: 'inherit', paddingTop: '15px' }}>
                  <Button variant="contained" id="upload" onClick={fileSelection}>
                    Select File
                  </Button>
                </div>}
            </div>
          </Box> : (currentTab === 'http' ?
              <Box sx={{
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'flex-start',
                justifyContent: 'center',
                flexDirection: 'row'
              }}>
                <div style={{ paddingBottom: '10px' }}>
                  cum
                </div>
              </Box>
            : null
          )}
        </Wrapper>
  );
};


export default Dashboard;

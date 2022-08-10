import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material/Select';
import { Audio } from '../components/Audio';
import { Http } from '../components/Http';
import { getChannelRedemptions, getUserId } from '../api/getUserId';
import { heartbeat, listen } from '../api/generateSocket';
import { Wrapper } from '../components/Wrapper';

const Dashboard = () => {
  const [currentTab, setCurrentTab] = useState('audio');
  const [channelRedemptions, setRedemptions] = useState([]);
  const [selectedRedemption, setSelectedRedemption] = useState('');
  const [listingVisible, setListingVisible] = useState(false);
  const [mapping, setMapState] = useState((window.electron.store.get('map') ? window.electron.store.get('map') : {}));
  const [httpMap, setHTTPMap] = useState(window.electron.store.get('wrapperMap') ? window.electron.store.get('wrapperMap') : {});

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

  const generateSocket = (redemptions: Record<string, string>[]) => {

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
        window.electron.ipcRenderer.sendMessage('axiosExec', [reward, redemptions]);
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
             generateSocket(innerResponse.data.data);
         })
       }
     });
  }, [navigate]);


  return (
        <Wrapper tab={setCurrentTab}>
          { currentTab === 'audio' ?
            <Audio
              selectHandleChange={selectHandleChange}
              selectedRedemption={selectedRedemption}
              fileSelection={fileSelection}
              listings={{ listingVisible, setListingVisible }}
              mapState={{ mapping, setMapState }}
              channelRedemptions={channelRedemptions}
            />
            : (currentTab === 'http' ?
              <Http
                mapState={{ httpMap, setHTTPMap }}
                channelRedemptions={channelRedemptions}
              />
            : null
          )}
        </Wrapper>
  );
};


export default Dashboard;

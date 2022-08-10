import { ChangeEvent, ReactElement, useState } from 'react';
import {
  Button,
  MenuItem,
  Select,
  Box,
  Modal,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';


interface HttpProps {
  mapState: {
    setHTTPMap: (value: unknown) => void,
    httpMap: Record<string, string[]>
  },
  channelRedemptions: never[]
}

export const Http = ({ mapState, channelRedemptions }: HttpProps): ReactElement => {
  const [endpoint, setEndpoint] = useState('');
  const [method, setMethod] = useState("GET");
  const [data, setData] = useState('');
  const [config, setConfig] = useState('');
  const [channelPointName, setChannelPointName] = useState('');
  const [modalState, setModalState] = useState(false);
  const [list, setList] = useState(mapState.httpMap);

  const handleEndpoint = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEndpoint(event.target.value)
  }

  const bindOnClick = () => {
    if (endpoint && method && channelPointName) {
      window.electron.ipcRenderer.sendMessage('axiosWrapper', [endpoint, method, data, config, channelPointName]);
      const newList = {...list};
      newList[channelPointName] = [endpoint, method, data, config, channelPointName];
      setList(newList);
      mapState.setHTTPMap(newList);
    }
  }

  const styles = {
    modal: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      minWidth: 620,
      maxHeight: '80vh',
      overflowY: 'auto' as const,
      backgroundColor: '#181818'
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
        <Modal open={modalState} onClose={() => setModalState(false)}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
              <div style={{ width: '100%', height: '30px', position: 'relative' }}>
                <IconButton sx={{ width: '24px', height: '24px', position: 'absolute', top: '25%', right: '10px' }} onClick={() => setModalState(false)}>
                  <CloseIcon sx={{ color: 'white' }}/>
                </IconButton>
              </div>
              <Table sx={{ margin: '10px', width: '600px' }}>
                <TableHead>
                  <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                    Redemption Name
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                    Binding Location
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                    Binding Type
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                    Actions
                  </TableCell>
                </TableHead>
                <TableBody>
                  {
                    Object.keys(list).map((key) => {
                      return (
                        <TableRow>
                          <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                            {key}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                            {list[key][0]}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                            {list[key][1]}
                          </TableCell>
                          <TableCell sx={{ border: '1px solid #515151', textAlign: 'center' }}>
                            <IconButton onClick={() => {
                              const map = Object.keys(list)
                                .filter((objKey) => !objKey.includes(key))
                                .reduce((obj, objKey) => {
                                  return Object.assign(obj, {
                                    [objKey]: list[objKey]
                                  });
                                }, {});
                              mapState.setHTTPMap(map);
                              setList(map);
                              window.electron.store.set('wrapperMap', map);
                            }}>
                              <DeleteIcon sx={{ color: 'red' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </Modal>
        <div style={{ height: '100%', paddingBottom: '15px', marginLeft: '73px', width: '92%' }}>
          <Button style={{ width: '20%', float: 'right' }} variant="contained" onClick={() => setModalState(true)}>
            View Current Bindings
          </Button>
        </div>
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

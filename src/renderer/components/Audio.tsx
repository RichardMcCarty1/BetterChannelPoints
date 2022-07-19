import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import React, { ReactElement } from 'react';
import { Collapse, MenuItem } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DeleteIcon from '@mui/icons-material/Delete';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Button from '@mui/material/Button';

interface AudioProps {
  selectHandleChange: (event: SelectChangeEvent) => void,
  selectedRedemption: string,
  fileSelection: () => void,
  listings: {
    setListingVisible:  React.Dispatch<React.SetStateAction<boolean>>
    listingVisible: boolean
  }
  mapState: {
    setMapState: (value: unknown) => void,
    mapping: Record<string, string>
  },
  channelRedemptions: never[]
}


export const Audio = ({ selectHandleChange, selectedRedemption, fileSelection, listings, mapState, channelRedemptions }: AudioProps): ReactElement => {
  return (
    <Box sx={{
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
                            onClick={() => listings.setListingVisible(!listings.listingVisible)}>
                  {listings.listingVisible ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </IconButton>
              </p>
            </div>
          </Box>

          <div style={{ display: listings.listingVisible ? 'inherit' : 'none' }}>
            {
              Object.entries(mapState.mapping).map((val) => {
                const value = val[1];
                return (
                  <Collapse in={listings.listingVisible}>
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
                            const map = Object.keys(mapState.mapping)
                              .filter((key) => !key.includes(val[0]))
                              .reduce((obj, key) => {
                                return Object.assign(obj, {
                                  [key]: mapState.mapping[key]
                                });
                              }, {});
                            mapState.setMapState(map);
                            window.electron.store.set('map', map);
                            listings.setListingVisible(false);
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
    </Box>
  );
};

export const heartbeat = (ws: WebSocket) => {
  const message = {
    type: 'PING'
  };
  ws.send(JSON.stringify(message));
}

function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


export const listen = (topic: string, token: string, ws: WebSocket) => {
 const message = {
   type: 'LISTEN',
   nonce: makeid(20),
   data: {
     topics: [topic],
     auth_token: token
   }
 };
 ws.send(JSON.stringify(message));
}

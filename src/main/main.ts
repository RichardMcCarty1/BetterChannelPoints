/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  net,
  IpcMainEvent,
} from 'electron';

import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import sound from 'sound-play';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { generateAuthUrl } from '../Constants';
import { axiosWrapper } from '../renderer/api/getUserId';

const store = new Store();
const dialog = require('electron').dialog;

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (_, key, val) => {
  store.set(key, val);
});

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let authWindow: BrowserWindow | null = null;

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

const validateToken = (): void => {
  const token = store.get('token');
  const req = net.request('https://id.twitch.tv/oauth2/validate');
  req.on('response', (response) => {
    if (response.statusCode !== 200) {
      // Token is no longer valid, OAuth Disconnected, Kill process
      if (mainWindow) {
        mainWindow.close();
      }
      app.quit();
    }
  });
  req.setHeader('Authorization', `OAuth ${token}`);
  req.end();
};

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('playsound', async (event, args) => {
  const map = <Record<string, string>> store.get('map', {});
  if (map[args[0]]) {
    sound.play(map[args[0]]).then(() => {
      console.log(map[args[0]]);
      event.reply('playsound', 'done')
    })
  }
});

ipcMain.on('axiosExec', async (event, args) => {
  const wrapperMapPre = <Record<string, string>> store.get('wrapperMap', {})
  const wrapperMap = wrapperMapPre[args[0]];
  let found = false;
  // eslint-disable-next-line no-restricted-syntax
  for (const redemption of args[1]) {
    if (redemption.title === args[0]) {
      found = true;
      break;
    }
  }
  if(wrapperMap && found) {
    const response = await (wrapperMap[2] ? axiosWrapper(wrapperMap[0], wrapperMap[1], wrapperMap[2]) : axiosWrapper(wrapperMap[0], wrapperMap[1]));
    event.reply('axiosExecute', {
      status: response.status,
      text: response.statusText,
      data: response.data,
    });
  }
});

ipcMain.on('importfile', async (event, args) => {
  dialog.showOpenDialog({
    properties: [ 'openFile' ],
    filters: [
      { name: 'Audio', extensions: ['mp3', 'wav', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then((response) => {
    if (!response.canceled) {
      const map = <Record<string, string>> store.get('map', {});
      map[args[0]] =  response.filePaths[0];
      store.set('map', map);
      event.reply('importfile', response.filePaths[0]);
    }
  })
})

ipcMain.on('axiosWrapper', async (event, args) => {
  const wrapperMap = <Record<string, string>> store.get('wrapperMap', {})
  wrapperMap[args[4]] = args;
  store.set('wrapperMap', wrapperMap)
});

// Generate Auth Token via Implicit Grant, store returned token in store, kill window
const generateAuthToken = async (event?: IpcMainEvent) => {
  authWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  });
  mainWindow?.webContents.session.clearCache();
  authWindow?.webContents.session.clearCache();

  const id = makeid(20);
  const authUrl = generateAuthUrl(id);

  await authWindow.loadURL(authUrl, {"extraHeaders" : "pragma: no-cache\n"});
  authWindow.show();

  // eslint-disable-next-line @typescript-eslint/no-shadow
  authWindow.webContents.on('will-navigate', (_, newUrl) => {
    const { hash } = new URL(String(newUrl));

    if (hash) {
      const token = hash.substring(hash.indexOf('=') + 1, hash.indexOf('&'));
      store.set('token', token);
      if (event) {
        if (authWindow) {
          authWindow.close();
        }
        event.reply('oauth-implicit', token);
      }
    }
  });

  authWindow.once('closed', () => {
    authWindow = null;
  });
};
// Generate OAuth Token on message, validate every 50 minutes
ipcMain.on('oauth-implicit', async (event) => {
  await generateAuthToken(event);
  setInterval(validateToken, 3000000);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.maximize();
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS, it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

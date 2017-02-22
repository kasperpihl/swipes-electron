const electron = require('electron');
const shortId = require('shortid');
const fs = require('fs');
const shell = require('electron').shell;
const config = require('./config.json');
const notifier = require('node-notifier');
const defaultMenu = require('./menu.js');
const appState = require('./app-state.js');
const env = config.env || 'dev';

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = electron;
const currentAppState = appState.get();
let win;

const createWindow = () => {
  const winOptions = {
    width: currentAppState.width,
    height: currentAppState.height,
    titleBarStyle: 'hidden-inset',
    frame: false,
    minWidth: 1000,
    minHeight: 600,
    title: 'Swipes',
    acceptFirstMouse: true,
    icon: './icons/logo.png',
    webPreferences: {
      blinkFeatures: 'OverlayScrollbars',
      preload: __dirname + '/preload/main-preload.js'
    }
  };

  win = new BrowserWindow(winOptions);
  win.setBounds(Object.assign(win.getBounds(), currentAppState), true);
  win.loadURL(config.appUrl);

  if (currentAppState.maximized) {
    win.maximize();
  }

  if (currentAppState.fullScreen) {
    win.setFullScreen(true);
  }

  if (env === 'dev') {
    win.webContents.openDevTools();
  }

  win.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  win.on('resize', () => {
    appState.save(win);
  })

  win.on('move', () => {
    appState.save(win);
  })

  win.on('closed', () => {
    win = null;
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(win, () => {
    win.loadURL(config.appUrl);
  })));

  const webContents = win.webContents;

  webContents.on('new-window', function(event, url){
    event.preventDefault();
    shell.openExternal(url);
  });

  win.webContents.session.on('will-download', (event, item, webContents) => {
    const id = shortId.generate();
    const filename = item.getFilename();

    item.on('updated', (event, state) => {
      const total = item.getTotalBytes();
      const done = item.getReceivedBytes();
      const percentage = Math.round(done / total * 100);

      win.webContents.send('toasty', {
        id,
        filename,
        percentage,
        state
      })
    })

    item.once('done', (event, state) => {
      win.webContents.send('toasty', {
        id,
        filename,
        percentage: 100,
        state
      })
    })
  })
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
ipcMain.on('notification', (event, arg) => {
  notifier.notify(arg);
})

ipcMain.on('showItemInFolder', (event, arg) => {

  try{
    fs.statSync(arg);
    event.returnValue = true;
    shell.showItemInFolder(arg);
  }
  catch(e){
    event.returnValue = false;
    console.log('could not find file');
  }
})
ipcMain.on('openItem', (event, arg) => {
  shell.openItem(arg);
})
ipcMain.on('openExternal', (event, arg) => {
  shell.openExternal(arg);
})

// Handle oauth
ipcMain.on('oauth-init', (event, arg) => {
  const handleCallback = (url) => {
    const raw_code = /[\?|\&]code=([^&]*)/.exec(url) || null;
    const error = /\?error=(.+)$/.exec(url);
    let code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    let winTitle = null;

    if (code) {
      winTitle = oauthWin.getTitle();
      code = decodeURIComponent(code);

      if (winTitle.length === 0) {
        return;
      }

      win.webContents.send('oauth-success', {
        serviceName: winTitle,
        queryString: {
          code: code
        }
      })
    } else if (error) {
      win.webContents.send('alert-message', {
        message: 'Oops! Something went wrong :/ Please try again.'
      })
    }

    if (code || error) {
      // Close the browser if code found or error
      oauthWin.destroy();
    }
  }
  let oauthWin = new BrowserWindow({
    width: 800,
    height: 600,
    title: arg.serviceName,
    show: false,
    webPreferences: {
      nodeIntegration: false
    }
  });

  if (env === 'dev') {
    oauthWin.webContents.openDevTools();
  }

  oauthWin.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  oauthWin.webContents.on('will-navigate', function (event, url) {
    handleCallback(url);
  });

  oauthWin.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
    handleCallback(newUrl);
  });

  oauthWin.loadURL(arg.url);
  oauthWin.show();

  oauthWin.on('closed', () => {
    oauthWin = null;
  }, false);
});

const electron = require('electron');
const config = require('./config.json');
const env = config.env || 'dev';

const {
  app,
  BrowserWindow,
  ipcMain
} = electron;
//const Menu = electron.Menu;
//const Tray = electron.tray;

// const showMainWindow = (show) => {
// 	if (mainWindow) {
// 		if (show) {
// 			mainWindow.show();
// 		} else {
// 			mainWindow.hide();
//     }
// 	}
// }

let win;
//let isQuitting = false;

const createWindow = () => {
  const winOptions = {
    width: 900,
    height: 700,
    title: 'Swipes Workspace',
    icon: './icons/logo.png'
  };

  win = new BrowserWindow(winOptions);
  win.loadURL(config.appUrl);

  if (env === 'dev') {
    win.webContents.openDevTools();
  }

  win.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

// Handle oauth
ipcMain.on('oauth-init', (event, arg) => {
  const handleCallback = (url) => {
    const raw_code = /code=([^&]*)/.exec(url) || null;
    const error = /\?error=(.+)$/.exec(url);
    let code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    let winTitle = null;

    // If there is a code, proceed to get token from github
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
      alert('Oops! Something went wrong :/ Please try again.');
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
    show: false
  });

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

//app.on('ready', () => {
  // Tray icon
  // const onTrayDoubleTap = (bounds) => {
  // 	mainWindow.show();
  // };
  // let appIcon = null;
  //
  // const iconPath = __dirname + '/tray.png';
  // const iconEventPath = __dirname + '/tray-event.png';
  //
  // appIcon = new Tray(iconPath);
  //
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Show', type: 'normal', click: () => {
  //       onTrayDoubleTap();
  //     }
  //   },
  //   { label: '-', type: 'separator' },
  //   { label: 'Quit', type: 'normal', click: () => {
  //       isQuitting = true;
  //       app.quit();
  //       appIcon.destroy();
  //     }
  //   },
  // ]);
  //
  // appIcon.setToolTip('Swipes');
  // appIcon.setContextMenu(contextMenu);
  // appIcon.on('double-clicked', (event, bounds) => {
  //   onTrayDoubleTap(bounds);
  // });
  //
  // mainWindow.on('focus', (event) => {
  //   appIcon.setImage(iconPath);
  // });
  //
  // // IPC
  // ipc.on('newEvent', function(event, arg) {
  //   if (!mainWindow.isFocused()) {
  //     appIcon.setImage(iconEventPath);
  //   }
  // });
//});

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

// app.on('activate-with-no-open-windows', () => {
// 	if (mainWindow) {
//     showMainWindow(true);
//   }
// });

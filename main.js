const electron = require('electron');
const {
  app,
  BrowserWindow
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
  win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false
    }
  });

  win.loadURL('https://dev.swipesapp.com/');
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

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

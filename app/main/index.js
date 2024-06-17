import path from 'path';
import { app, crashReporter, screen, BrowserWindow, Menu, Tray } from 'electron';

//const isDevelopment = process.env.NODE_ENV === 'development';
const isDevelopment = false;
let mainWindow = null;
let forceQuit = false;

crashReporter.start({
  productName: 'YourName',
  companyName: 'YourCompany',
  submitURL: 'https://your-domain.com/url-to-submit',
  uploadToServer: false,
});

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  const display = screen.getPrimaryDisplay();
  const maxSize = display.workAreaSize;

  mainWindow = new BrowserWindow({
    height: maxSize.height,
    width: maxSize.width,
    minWidth: 640,
    minHeight: 480,
    //skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
    },
    transparent: isDevelopment === false,
    frame: isDevelopment === true,
    //fullscreen: true,
    //resizable: false,
  });

  const tray = new Tray('./app/main/icon.png');
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: function () {
        mainWindow.show();
      },
    },
    {
      label: 'Edit Mode',
      type: 'checkbox',
      checked: false,
      click: function (event) {
        mainWindow.setIgnoreMouseEvents(!event.checked, { forward: true });
      },
    },
    {
      label: 'Quit',
      click: function () {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  //mainWindow.setIgnoreMouseEvents(true);
  mainWindow.loadFile(path.resolve(path.join(__dirname, '../renderer/index.html')));
  //mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.setAlwaysOnTop(true, 'screen');
  //mainWindow.setFocusable(false);
  // show window once on first load
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    // Handle window logic properly on macOS:
    // 1. App should not terminate if window has been closed
    // 2. Click on icon in dock should re-open the window
    // 3. ⌘+Q should close the window and quit the app
    if (process.platform === 'darwin') {
      mainWindow.on('close', function (e) {
        if (!forceQuit) {
          e.preventDefault();
          mainWindow.hide();
        }
      });

      app.on('activate', () => {
        mainWindow.show();
      });

      app.on('before-quit', () => {
        forceQuit = true;
      });
    } else {
      mainWindow.on('closed', () => {
        mainWindow = null;
      });
    }
  });

  mainWindow.on('minimize', function (event) {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

  if (isDevelopment) {
    // auto-open dev tools
    mainWindow.webContents.openDevTools();

    // add inspect element on right click menu
    mainWindow.webContents.on('context-menu', (e, props) => {
      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click() {
            mainWindow.inspectElement(props.x, props.y);
          },
        },
      ]).popup(mainWindow);
    });
  }
});

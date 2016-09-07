const app = require('electron').app;
const path = require('path');
const fs = require('fs');
const filePath = path.join(app.getPath('userData'), 'app-state.json');
const defaultState = {
  width: 900,
  height: 700
}
let timeout = null;

const createFileIfDoesNotExistsSync = () => {
  try {
    fs.accessSync(filePath);
  } catch (e) {
    fs.writeFileSync(filePath, JSON.stringify(defaultState), 'utf8');
  }
}

const get = () => {
  createFileIfDoesNotExistsSync();
  const state = fs.readFileSync(filePath, 'utf8');

  return JSON.parse(state);
}

const save = (mainWindow) => {
  const bounds = mainWindow.getBounds();
  const state = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    maximized: mainWindow.isMaximized(),
    fullScreen: mainWindow.isFullScreen()
  };
  const newState = Object.assign({}, defaultState, state);

  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    fs.writeFileSync(filePath, JSON.stringify(newState), 'utf8');
  }, 100);
}

module.exports = {
  get,
  save
}

var {ipcRenderer} = require('electron');

window.sendEvent = function (actionName) {
  ipcRenderer.sendToHost('mixpanel', {
    manifest_id: 'dropbox',
    action: actionName
  });
}

var {ipcRenderer} = require('electron');
window.workspaceSendFunction = function(data){
	ipcRenderer.sendToHost('message', data);
}
ipcRenderer.on('message', (event, data) => {
	swipes.com.receivedCommand(data);
});
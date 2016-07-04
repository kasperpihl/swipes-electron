var {ipcRenderer} = require('electron');
window.parent = {};
parent.postMessage = function(data){
	ipcRenderer.sendToHost('message', data);
}
ipcRenderer.on('message', (event, data) => {
	swipes._com.receivedMessage(data);
});
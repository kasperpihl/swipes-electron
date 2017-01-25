var {ipcRenderer} = require('electron');
window.sendToSwipes = (data) => {
  ipcRenderer.sendToHost('message', data);
}
ipcRenderer.on('message', (sender, data) => {
  if(data && data.type === 'open'){
    const ref = document.querySelector('#channels_scroller a[data-member-id="' + data.id + '"]');
    if(ref){
      ref.click();
    }
  }
})

window.swStatus = {
  counter: 0,
  unread: 0
};

const handleUnreads = (turnoffLoading) => {
  let counter = 0;
  let unread = 0;
  const counters = [...document.getElementsByClassName('unread_highlights')].map((el) => {
    const string = el.innerHTML.replace(/^\s+|\s+$/g, '');
    return string.length ? parseInt(string, 10) : 0;
  })

  if(counters.length){
    counter = counters[0];
    if(counters.length > 1){
      counter = counters.reduce((a, b) => (a+b));
    }
  }

  const unreads = [...document.getElementsByClassName('unread_msgs')].map(el => parseInt(el.innerHTML, 10));
  if(unreads.length){
    unread = unreads[0];
    if(unreads.length > 1){
      unread = unreads.reduce((a, b) => (a + b));
    }
  }
  if(swStatus.unread !== unread || swStatus.counter !== counter){
    swStatus.unread = unread;
    swStatus.counter = counter;
    sendToSwipes(swStatus);
  }
}
window.loadObserver = new MutationObserver(() => {
  if(document.getElementById('channels_scroller')){

    window.swipyServer = new MutationObserver(handleUnreads);
    swipyServer.observe(document.getElementById('channels_scroller'), {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true
    });
    window.loadObserver.disconnect();
    handleUnreads();
  }
})

window.loadObserver.observe(document, {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true
});

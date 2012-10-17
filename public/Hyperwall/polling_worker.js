self.addEventListener('message', function(e) {
  self.postMessage("received: "+e.data);
}, false);
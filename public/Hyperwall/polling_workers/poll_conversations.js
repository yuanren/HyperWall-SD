function poll_conversations(timeout){
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout(poll_conversations(), timeout);  
	    }
	  };
    xhr.open("GET","../../get_guid?type=Conversation",true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message); }
}

self.addEventListener('message', function(e) {
  //self.postMessage("worker started");
  poll_conversations(e.data);
}, false);
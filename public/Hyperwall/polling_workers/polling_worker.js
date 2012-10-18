var Timeout = 3000; //Default timeout at 3000ms

function poll_conversations(){
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout(poll_conversations(), Timeout);
	    }
	  };
    xhr.open("GET","../../get_guid?type=Event",true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message); setTimeout(poll_conversations(), Timeout); }
}

self.addEventListener('message', function(e) {
  //self.postMessage("worker started");
  Timeout = e.data.interval;
  poll_conversations();
}, false);
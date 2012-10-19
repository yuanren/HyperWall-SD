var Poll_Timeout = 3000; //Default timeout at 3000ms

function poll_conversation_guids(){
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout(poll_conversations_guids(), Poll_Timeout);
	    }
	  };
    xhr.open("GET","../../get_guid?type=Conversation",true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message); setTimeout(poll_conversations_guids(), Poll_Timeout);}
}

self.addEventListener('message', function(e) {
  //self.postMessage("worker started");
  Timeout = e.data.interval;
  switch(e.data.type){
    case "Conversation_GUIDs":
      poll_conversations_guids();
      break;
    case "Conversation":
      poll_conversation(e.data.guid);
      break;
  }
  //if(e.data.type == "Conversation_GUIDs"){ poll_conversations(); }
}, false);
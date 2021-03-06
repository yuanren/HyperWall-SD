var Poll_Timeout = 3000; //Default timeout at 3000ms


function poll_conversations(){
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout( function(){ poll_conversations() }, Poll_Timeout);
      }
    };
    xhr.open("GET","../../get_objects?type=Conversation",true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message);}
}

/*
function poll_conversation_guids(){
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout( function(){ poll_conversation_guids() }, Poll_Timeout);
	    }
	  };
    xhr.open("GET","../../get_guid?type=Conversation",true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message);}
}

function poll_conversation(guid){
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout( function(){ poll_conversation(guid) }, Poll_Timeout);
      }
    };
    xhr.open("GET","../../get_properties?GUID="+guid+"&depth=0",true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message);}
}
*/

self.addEventListener('message', function(e) {
  //self.postMessage("worker started");
  Poll_Timeout = e.data.interval;
  switch(e.data.type){
    case "Conversations":
      poll_conversations();
      break;
    /*case "Conversation_GUIDs":
      poll_conversation_guids();
      break;
    case "Conversation":
      poll_conversation(e.data.GUID);
      break;*/
  }
}, false);
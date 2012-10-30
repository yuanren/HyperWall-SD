var Poll_Timeout = 3000; //Default timeout at 3000ms


function poll_breadcrumb(){
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


self.addEventListener('message', function(e) {
  Poll_Timeout = e.data.interval;
  poll_breadcrumb();
}, false);
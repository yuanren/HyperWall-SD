var Poll_Timeout = 3000; //Default timeout at 3000ms
var Object_GUID = "";

function poll_breadcrumb(){
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout( function(){ poll_breadcrumb() }, Poll_Timeout);
      }
    };
    xhr.open("GET", "../../get_breadcrumbs?GUIDs%5B%5D="+Object_GUID, true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message);}
}


self.addEventListener('message', function(e) {
  switch(e.data.type){
    case "START":
      Poll_Timeout = e.data.interval;
      Object_GUID = e.data.object_guid;
      poll_breadcrumb();
      break;
    case "STOP":
      self.close();
      break;
  }
}, false);
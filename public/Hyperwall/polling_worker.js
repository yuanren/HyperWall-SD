function poll_conversations(){
  /*$.ajax({ 
    url: "../get_guid", dataType: "json",
    data: {type: "Event"},
    complete:  setTimeout(poll_conversations, 5000),
    success: function(rcv_data){
      console.log("conversations_received");
      callback_function(rcv_data);
    } // end success
  });*/
  try {
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status ==0) { postMessage(xhr.responseText); }
        else { throw  xhr.status+xhr.responseText; }
        setTimeout(poll_conversations(), 5000);  
	  }
	};
    xhr.open("GET","../get_guid?type=Event",true);
    xhr.send();
  } catch(e){ postMessage("ERROR:"+e.message); }


/*
    xhr.onreadystatechange=function()
  {
  if (xhr.readyState==4 && xhr.status==200)
    {
    self.postMessage(xhr.responseText);
    setTimeout(poll_conversations(), 5000);
    }
  }
  xhr.open("GET","../get_guid?type=Event",true);
  xhr.send();
  } catch (e) { postMessage("ERROR:"+e.message); }
*/
}

self.addEventListener('message', function(e) {
  //console.log("worker started");
  self.postMessage("worker started");
  poll_conversations(
    //function(rcv_data){ 
      //console.log(rcv_data);
      //self.postMessage(rcv_data);
    //}
  );


  //self.postMessage("received: "+e.data);
}, false);
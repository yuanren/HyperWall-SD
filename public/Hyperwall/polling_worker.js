function poll_conversations(callback_function){
  $.ajax({ 
    url: "../get_guid", dataType: "json",
    data: {type: "Event"},
    complete:  setTimeout(poll_conversations, 5000),
    success: function(rcv_data){
      console.log("conversations_received");
      callback_function(rcv_data);
    } // end success
  });	
}

self.addEventListener('message', function(e) {
  //console.log("worker started");
  self.postMessage("worker started");
  poll_conversations(
    function(rcv_data){ 
      //console.log(rcv_data);
      self.postMessage(rcv_data);
    }
  );


  //self.postMessage("received: "+e.data);
}, false);
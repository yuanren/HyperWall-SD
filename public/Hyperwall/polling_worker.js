function poll_conversations(callback_function){
  $.ajax({ 
    url: "../get_guid", dataType: "json",
    data: {type: "conversation"},
    complete:  setTimeout(poll_conversations, 5000),
    success: function(rcv_data){
      console.log("conversations_received");
      callback_function(rcv_data);
    } // end success
  });	
}

self.addEventListener('start_poll', function(e) {

  poll_conversations(
    function(rcv_data){ 
      //console.log(rcv_data);
      self.postMessage(rcv_data);
    }
  );


  //self.postMessage("received: "+e.data);
}, false);

function sd_create (type, post_data){
  
  $.ajax({
      type: 'POST', url: "../"+type+".json",
      data: post_data, dataType: 'json',
      success: function(rcv_data){ 
        console.log(rcv_data);
        return rcv_data.GUID;
      }
  });

}
 
 /*       
        $(".btns_create").click(function() {
          var post_data = { label: $("#person_label").val() }         
          $.ajax({
            type: 'POST', url: "../people.json",
            data: post_data, dataType: 'json',
            success: function(rcv_guid){ 
              console.log(rcv_guid);
            }
          });
        });

        $("#btn_create_person").click(function() {
          var post_data = { label: $("#person_label").val() }         
          $.ajax({
            type: 'POST', url: "../people.json",
            data: post_data, dataType: 'json',
            success: function(rcv_guid){ 
              console.log(rcv_guid);
            }
          });
        });
        $("#btn_create_event").click(function() {      
          $.ajax({
            type: 'POST', url: "../events.json",
            data: { label: $("#event_label").val(), dateTime: $("#event_datetime").val() }, dataType: 'json',
            success: function(rcv_guid){ 
              console.log(rcv_guid);
            }
          });
        });
  */
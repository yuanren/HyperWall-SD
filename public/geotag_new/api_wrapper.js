
function sd_create (type, post_data){
  $.ajax({
      type: 'POST', url: "../"+type+".json",
      data: post_data, dataType: 'json', async: false,
      success: function(rcv_data){ 
        console.log(rcv_data);
        return rcv_data['GUID'];
      }
  });
}

function sd_get (type, get_data){
  //var rcv_guid;
  $.ajax({
      type: 'GET', url: "../get_"+type,
      data: get_data, dataType: 'json', async: false,
      success: function(rcv_data){ 
        console.log(rcv_data);
      }
  });
}
 
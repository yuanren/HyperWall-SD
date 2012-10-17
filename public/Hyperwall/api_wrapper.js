// Shorthanded Situation DB API calls
function sd_create (type, post_data, callback_function){
  $.ajax({
      type: 'POST', url: "../"+type+".json",
      data: post_data, dataType: 'json'
      success: function(rcv_data){ 
        callback_function(rcv_data);
        //return rcv_data['GUID'];
      }
  });
}

function sd_get (type, get_data){
  $.ajax({
      type: 'GET', url: "../get_"+type,
      data: get_data, dataType: 'json'/*, async: false,*/
      success: function(rcv_data){ 
        console.log(rcv_data);
      }
  });
}
 
// Shorthanded Google Map API calls

function gm_create_marker(type, location) {
  //switch(type)
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng( location[0], location[1]),
    map: map,
    icon: "http://maps.google.com/mapfiles/marker.png"
  });
}
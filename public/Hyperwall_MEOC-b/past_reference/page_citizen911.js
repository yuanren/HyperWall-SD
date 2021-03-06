var citizen_911_events_hash = new Object();

function initialize() {
  var markers = new Array(), info_windows = new Array();
  var myLatlng = new google.maps.LatLng(37.410425,-122.059754);
  var mapOptions = { zoom: 15, center: myLatlng, mapTypeId: google.maps.MapTypeId.ROADMAP }
  var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  

  var parsed_json = jQuery.parseJSON(JSON.stringify(json_data));
  $(parsed_json.markers).each( function(){

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng( this.place.latitude, this.place.longitude),
      map: map,
      animation: google.maps.Animation.DROP,
      icon: "http://maps.google.com/mapfiles/marker.png"
    });

    var info_str = '<div class="inmap_dialog"><div class="event_content">';
    info_str += '<h1>'+this.name+'</h1>';
    info_str += '<b>ResourceID</b>: '+this.resourceID;
    info_str += '<br><b>EventID</b>: '+this.eventID;
    info_str += '<br><b>Time</b>: '+this.datetime;
    
    if(this.images != {} ) { info_str += '<br><b>Images</b>:<br><img style="max-width: 256px" src="'+this.images[0]+'"></div>'};
    info_str += '<div class="event_messages">';
    info_str += '<b>Messages</b>:';
    $(this.messages).each( function(){ info_str += '<div class="event_msg">'+this+'</div>'; });
    //+this.messages[0];
    info_str += '</div>';
    info_str += '<button class="event_ask_btn" type="button"> Ask for More Info </button>';
    info_str += '</div>';
    var info_window = new google.maps.InfoWindow({ content: info_str });
    //info_windows.push(info_window);
    google.maps.event.addListener(marker, 'click', function() {
      map.setZoom(17);
      info_window.open(map,marker);
    });
  });
  // end of situation db actions


  function poll_citizen_911(){
  // request events from citizen911
  $.ajax({ 
    url: "http://www.citizen911.com/api/report/incidents.json",
    data: {ae: "cert", authority: "mountainview.gov"},
    dataType: "json",
    complete:  setTimeout(poll_citizen_911, 5000),
    success: function(rcv_events){
      console.log("events_list_received");
      $.each(rcv_events.result, function(){
        //console.log(this['recordid']);
        var event_id = this['recordid'];  
        if(!citizen_911_events_hash.hasOwnProperty(event_id)){
        citizen_911_events_hash[event_id] = true;
        console.log("new citizen 911 event");
          $.ajax({
            url: 'http://www.citizen911.com/api/blob',
            data: {filename: event_id+"-report.json"},
            success: function(rcv_report){
// on successfully receiving a citizen 911 report
  console.log(rcv_report);
  map.setCenter(new google.maps.LatLng( rcv_report.location.center[1]/1000000, rcv_report.location.center[0]/1000000));
  var marker = new google.maps.Marker({
    position: new google.maps.LatLng( rcv_report.location.center[1]/1000000, rcv_report.location.center[0]/1000000),
    map: map,
    animation: google.maps.Animation.BOUNCE,
    icon: "http://maps.google.com/mapfiles/marker_orange.png"
  });

  var info_str = '<div class="inmap_dialog"><div class="event_content" style="width: 100%;">';
  info_str += '<h1>'+rcv_report.location.address.street+'</h1>';
  info_str += '<b>AuthorID</b>: '+rcv_report.author.uid;
  info_str += '<br><b>EventID</b>: '+event_id;
  info_str += '<br><b>Time</b>: '+rcv_report.created;
  info_str += '</div>';
  info_str += '<button value="'+event_id+'" class="citizen_report_btn" type="button"> Go to Citizen 911 Report </button>';
  info_str += '</div>';
  var info_window = new google.maps.InfoWindow({ content: info_str });
    
  google.maps.event.addListener(marker, 'click', function() {
    map.setZoom(17);
    info_window.open(map,marker);
    $.each(rcv_report.author.track, function(){
      console.log("point @ " +this.point[1]/1000000+", "+this.point[0]/1000000);
      var marker = new google.maps.Marker({
      position: new google.maps.LatLng( this.point[1]/1000000, this.point[0]/1000000),
      map: map,
      icon: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle_blue.png"
      });
    });      
  });

            }
          });
        }
      }); //end each
    } // end success
  });

  };


  $(document).ready(function(){
    //$('#citizen_911_btn').click(function() { 
      //map.setZoom(15);
      poll_citizen_911();
    //});

    $(document).on("click", ".citizen_report_btn", function(){
      var citizen_911_url = "http://www.citizen911.com/common/start/report.html?"+this.value;
      window.open(citizen_911_url);
    }); 
    
  });

}




  

  /*
  $.ajax({
    url: 'http://www.citizen911.com/api/report/summary.json',
    data: {ae: "cert", authority: "mountainview.gov"},
    success: function(rcv_events){
      console.log(rcv_events);
    }
  });

  $.ajax({
    url: 'http://www.citizen911.com/api/ao/zone/boundaries/mountainview.gov-boundaries.json',
    success: function(rcv_events){
      console.log(rcv_events);
    }
  });
  */
  //http://www.citizen911.com/report/create


  //$(document).on("click", "#test_btn", function(){ alert("Goodbye!"); }); 



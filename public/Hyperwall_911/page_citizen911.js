var citizen_911_events_hash = new Object();

function initialize() {
  //var markers = new Array(), info_windows = new Array();
  var myLatlng = new google.maps.LatLng(37.410425,-122.059754);
  var mapOptions = { zoom: 15, center: myLatlng, mapTypeId: google.maps.MapTypeId.ROADMAP }
  var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
  
  // Semantic Mockup
  var s_marker = new google.maps.Marker({
    position: new google.maps.LatLng( 37.410585, -122.059664),
    map: map, icon: "http://maps.google.com/mapfiles/marker.png"
  });
  var s_info_str =
    '<div class="semantic_dialog"><div class="s_event_content">'+
    '<h1>Interior fire Building 23</h1>'+
    '<h2>Silicon Valley Campus NASA Research Park, Bldg. 23</h2>'+
    '<h3><b>Location:</b> S Akron Rd Mountain View, CA 94043</h3>'+
    '<h3><b>Latitude:</b> 37.410585  <b>Longitude:</b> -122.059664</b></h3></div><hr>'+
    '<div class="cat_level_1">'+
    '<div class="cat_1_title"><u>Situation Description(4)</u></div>'+
    '<div class="msg_box_1">All units acknowledge your personal action report. - <a href="#">admin</a></div>'+
    '<div class="msg_box_1">Discover fire source here. B side staircase to basement. - <a href="#">admin</a></div>'+
    '<div class="msg_box_1">Entered A side of the building. Dense black smoke from lower stairway indicates fire is in basement. - <a href="#">NPS Unit 1</a></div>'+
    '<div class="cat_1_title"><u>Problem Report(0)</u></div>'+
    '<div class="cat_1_title"><u>Something Else(0)</u></div>'+
    '</div><hr>'+
    '<div class="cat_level_2">'+
    '<div class="cat_2_title"><u>Advice(1)</u></div>'+
    '<div class="msg_box_2">get out of there ASAP. - <a href="#">admin</a></div>'+
    '<div class="cat_2_title"><u>Details(0)</u></div>'+
    '<div class="cat_2_title"><u>Explanations(0)</u></div>'+
    '</div></div>';
  var s_info_window = new google.maps.InfoWindow({ content: s_info_str });
  google.maps.event.addListener(s_marker, 'click', function(){ s_info_window.open(map, s_marker); });


  $(document).on("click", ".cat_1_title", function(){
    $('.msg_box_1').fadeIn();
  });
  $(document).on("click", ".msg_box_1", function(){
    $('.cat_level_2').fadeIn();
  });
  $(document).on("click", ".cat_2_title", function(){
    $('.msg_box_2').fadeIn();
  });


//end of mockup

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
  //animation: google.maps.Animation.BOUNCE,
  icon: "http://maps.google.com/mapfiles/marker_orange.png"
});

var info_str =
  '<div class="inmap_dialog"><div class="event_content" style="width: 100%;">'+
  '<h1>'+rcv_report.location.address.street+'</h1>'+
  '<b>AuthorID</b>: '+rcv_report.author.uid+
  '<br><b>EventID</b>: '+event_id+
  '<br><b>Time</b>: '+rcv_report.created+
  '</div>'+
  '<button value="'+event_id+'" class="citizen_report_btn" type="button"> Go to Citizen 911 Report </button>'+
  '</div>';
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


  // document ready functions
  $(document).ready(function(){
    $('#polling_citizen_911').click(function() { 
      //map.setZoom(15);
      poll_citizen_911();
    });

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


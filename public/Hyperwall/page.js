// Global Google Map variables
var MAP;
  
// Global Hyperwall variables
var CONVERSATION_GUIDS_POLL_INTERVAL = 5000;
var MSG_POLL_INTERVAL = 3000, CRUMB_POLL_INTERVAL = 2000, CONVERSATION_POLL_INTERVAL = 8000;
var HYPERWALL_USER_GUID = "";
var SPECIAL_USERS = new Array();
var CONVERSATIONS_HASH = new Object();
var EVENTS_HASH = new Object();

var CONVERSATION_POLLING_WORKERS = new Array();

var MAP_MARKERS_HASH = new Object();


function initialize() {
  // Register Hyperwall on SDB
  if(typeof(Storage)!=="undefined"){
    console.log("HTML5 Local Storage Supported");
    if(localStorage['HYPERWALL_USER_GUID'] == undefined){
      console.log("Register New Hyperwall GUID");
      sd_create(
        "people",
        { label: "HyperWall_User" },
        function(rcv_data){ 
          console.log("Receive GUID: "+rcv_data.GUID);
          localStorage['HYPERWALL_USER_GUID'] = rcv_data.GUID;
        }
      ); 
    } else { console.log("Found Local Hyperwall GUID: "+localStorage['HYPERWALL_USER_GUID']) }
    HYPERWALL_USER_GUID = localStorage['HYPERWALL_USER_GUID'];
  }

  // Construct Google Map
  MAP = new google.maps.Map(
    document.getElementById('map_canvas'), 
    { zoom: 15, center: new google.maps.LatLng(37.410425,-122.059754), mapTypeId: google.maps.MapTypeId.ROADMAP }
  );

  // Start conversation polling worker thread
  var guids_polling_worker = new Worker('polling_workers/polling_worker.js');
  guids_polling_worker.addEventListener(
    'message',
    function(e){
      // Receive Conversation GUIDs from Server
      var rcv_json = $.parseJSON(e.data);
      console.log(rcv_json);
      for(var i=0; i<rcv_json.GUIDs.length; ++i){
        if(!CONVERSATIONS_HASH.hasOwnProperty(rcv_json.GUIDs[i])){
          console.log("Received new conversation: "+rcv_json.GUIDs[i])
          CONVERSATIONS_HASH[rcv_json.GUIDs[i]] = true;
          
          // Create polling workers for one Conversation
          var  conversation_polling_worker = new Worker('polling_workers/polling_worker.js');
          conversation_polling_worker.addEventListener(
            'message',
            function(e){
              // Receive Conversation properties from Server
              var rcv_json = $.parseJSON(e.data);
              console.log(rcv_json);
              //for(var i=0; i<rcv_json.GUIDs.length; ++i){
              //  if(!CONVERSATIONS_HASH.hasOwnProperty(rcv_json.GUIDs[i])){
              //    console.log("Received new conversation: "+rcv_json.GUIDs[i])
              //  }        
              //}
            },
            false
          );
          conversation_polling_worker.postMessage( {type: "Conversation_GUIDs", interval: CONVERSATION_POLL_INTERVAL, GUID: rcv_json.GUIDs[i]}); 
        }        
      }
      
    },
    false
  );
  guids_polling_worker.postMessage( {type: "Conversation_GUIDs", interval: CONVERSATION_GUIDS_POLL_INTERVAL}); 



  //gm_create_marker("test", [37.410425,-122.059754]);




/*
  var parsed_json = jQuery.parseJSON(JSON.stringify(json_data));
  $(parsed_json.markers).each( function(){

    var marker = new google.maps.Marker({
      position: new google.maps.LatLng( this.place.latitude, this.place.longitude),
      map: map,
      animation: google.maps.Animation.DROP,
      icon: "http://maps.google.com/mapfiles/marker.png"
    });

    var info_str = '<div class="inmap_dialog"><h1>Conversation Label</h1><div class="event_content" >';
    //info_str += '';
    //info_str += '<b>ResourceID</b>: '+this.resourceID;
    //info_str += '<br><b>EventID</b>: '+this.eventID;
    //info_str += '<br><b>Time</b>: '+this.datetime;
    
    if(this.images != {} ) { info_str += '<div class="test_event"><div style="position:absolute; margin: 8px 3px; width: 256px; background-color: #000; color: #fff;">Label - <a href="#">John</a> on HH:MM:SS</div><img style="max-width: 256px" src="'+this.images[0]+'"></div></div>'};
    info_str += '<div class="event_messages">';
    //info_str += '<b>Messages</b>:';
    $(this.messages).each( function(){ info_str += '<div class="event_msg"><b>'+this+'</b> - <a href="#">John</a><div style="display:block; text-align:right; font-size:12px;">HH:MM:SS</div></div>'; });
    //+this.messages[0];
    info_str += '<input type="text" style="width: 100%;"></div>';
    info_str += '</div>';
    var info_window = new google.maps.InfoWindow({ content: info_str });
    //info_windows.push(info_window);
    google.maps.event.addListener(marker, 'click', function() {
      map.setZoom(17);
      info_window.open(map,marker);
    });
  });
  // end of situation db actions


  $('body').on("click", ".inmap_dialog a", function(){
    console.log('click');
    var marker = new google.maps.Marker({
      position: new google.maps.LatLng( 37.410323, -122.05886),
      map: map,
      icon: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png"
    });
    var marker2 = new google.maps.Marker({
      position: new google.maps.LatLng( 37.410313, -122.05896),
      map: map,
      icon: "https://maps.gstatic.com/intl/en_us/mapfiles/markers2/measle.png"
    });
    var marker5 = new google.maps.Marker({
      position: new google.maps.LatLng( 37.410343, -122.05897),
      map: map,
      icon: "http://files.softicons.com/download/system-icons/web0.2ama-icons-by-chrfb/png/24x24/Maps%20-%20Pedestrian.png"
    });
   
    var info_str = '<div style="width: 160px;"><h1>John</h1>';
    
    //info_str += '<div class="test_event"><div style="position:absolute; margin: 8px 3px; width: 256px; background-color: #000; color: #fff;">Label - <a href="#">John</a> on HH:MM:SS</div><img style="max-width: 256px" src="'+this.images[0]+'"></div></div>'};
    //info_str += '<div class="event_messages">';
    //info_str += '<b>Messages</b>:';
    //$(this.messages).each( function(){ info_str += '<div class="event_msg"><b>'+this+'</b> - <a href="#">John</a><div style="display:block; text-align:right; font-size:12px;">HH:MM:SS</div></div>'; });
    //+this.messages[0];
    //info_str += '</div>';
    info_str += '</div>';
    var info_window = new google.maps.InfoWindow({ content: info_str });
    //info_windows.push(info_window);
    //google.maps.event.addListener(marker, 'click', function() {
      //map.setZoom(17);
      info_window.open(map,marker5);
    //});

  });
*/


  



}


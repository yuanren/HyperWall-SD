// Global Google Map variables
var MAP;
  
// Global Hyperwall variables
var CONVERSATION_GUIDS_POLL_INTERVAL = 50000;
var CRUMB_POLL_INTERVAL = 2000, CONVERSATION_POLL_INTERVAL = 80000;

var HYPERWALL_USER_GUID = "";
var SPECIAL_USERS = new Array();

var CONVERSATIONS_HASH = new Object();
var EVENTS_HASH = new Object();

var CONVERSATION_POLLING_WORKERS_HASH = new Object();

var CONVERSATION_MAP_MARKERS_HASH = new Object();
var CONVERSATION_INFO_WINDOWS_HASH = new Object();



function add_to_critical_list(msg){
  $("#critical_list header").after(
    '<div class="critical_msg">'+msg+'</div>'
  );
}


function polling_conversation_guid(guid){  
  // Create polling workers for one Conversation
  var conversation_polling_worker = new Worker('polling_workers/polling_worker.js');
  CONVERSATION_POLLING_WORKERS_HASH[guid] = conversation_polling_worker;
  conversation_polling_worker.addEventListener(
    'message',
    function(e){
      // Receive Conversation properties from Server
      var rcv_json = $.parseJSON(e.data);
      console.log(rcv_json);
      if (CONVERSATIONS_HASH[guid] != rcv_json.object.lastUpdated){
        console.log("new or updated conversation: "+guid);
        CONVERSATIONS_HASH[guid] = rcv_json.object.lastUpdated;
        add_to_critical_list("<b>Conversation</b>:<br> "+rcv_json.object.label);
      }
    },
    false
  );
  conversation_polling_worker.postMessage( {type: "Conversation", interval: CONVERSATION_POLL_INTERVAL, GUID: guid}); 

}


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
          polling_conversation_guid(rcv_json.GUIDs[i]);
        }        
      }
    },
    false
  );
  guids_polling_worker.postMessage( {type: "Conversation_GUIDs", interval: CONVERSATION_GUIDS_POLL_INTERVAL}); 


  // Mockup & Response Test
  test_guid = "26329f98-198b-11e2-8473-7071bc51ad1f"
  CONVERSATION_MAP_MARKERS_HASH[test_guid] = gm_create_marker("test", [37.410425,-122.059754]);

  var test_info_str = "";
  sd_get(
    "properties",
    { GUID: test_guid, depth: 1 },
    function(rcv_data){
      console.log(rcv_data);
      test_info_str =
        '<div class="inmap_dialog"><h1 class="dialog_title">'+rcv_data.object.label+'</h1>'+

        '<div class="dialog_pics">'+
        '<div class="dialog_pic"><div class="dialog_pic_title"><a href="#" class="dialog_pic_user">Anonymous</a> @ MM:SS</div>'+
        '<img src="http://www.wolfforthfireems.com/images/gallery/20080324_live_fire_04.jpg"></div></div>'+

        '<div class="dialog_texts">';
        
      $(rcv_data.associated_objects[0][1]).each( function(){ 
        test_info_str += '<hr><div class="dialog_text_title">By <a href="#" class="dialog_text_user">Anonymous</a> @ '+
        this.dateTime+'</div><div class="dialog_text">'+this.payload+'</div>';
      });

      test_info_str += '<input type="text" class="response_text" style="width: 100%">'+
      '<button class="more_info_btn">More Info</button> </div></div>';
      
  
      

      CONVERSATION_INFO_WINDOWS_HASH[test_guid] = new google.maps.InfoWindow({ content: test_info_str });
      google.maps.event.addListener(CONVERSATION_MAP_MARKERS_HASH[test_guid], 'click', function() {
        MAP.setZoom(17);
        CONVERSATION_INFO_WINDOWS_HASH[test_guid].open(MAP, CONVERSATION_MAP_MARKERS_HASH[test_guid]);
      });


    }
  );
  
  $('body').on("click", ".more_info_btn", function(){
    sd_create(
      "messages",
      { text: $(".response_text").val(), sender: HYPERWALL_USER_GUID, recipient: "SSN", conversation: test_guid }
    );
  });  

    






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


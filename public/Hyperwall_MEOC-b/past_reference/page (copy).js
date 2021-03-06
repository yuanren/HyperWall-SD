// Global Google Map variables
var MAP;
  
// Global Hyperwall variables
var CONVERSATION_GUIDS_POLL_INTERVAL = 50000;
var CRUMB_POLL_INTERVAL = 2000, CONVERSATION_POLL_INTERVAL = 80000;

var HYPERWALL_USER_GUID = "";
var SPECIAL_USERS = new Array();



// Conversation Properties Hashes
var CONVERSATION_HASH = new Object();
CONVERSATION_HASH["STATUS"] = new Object(); // [GUID] -> lastUpdated or "Ignore"
CONVERSATION_HASH["POLLING_WORKERS"] = new Object(); // [GUID] -> Polling Worker 
CONVERSATION_HASH["MAP_MARKERS"] = new Object(); // [GUID] -> Map Marker
CONVERSATION_HASH["INFO_WINDOWS"] = new Object(); // [GUID] -> Info Window
CONVERSATION_HASH["LABELS"] = new Object(); // [GUID] -> Label
CONVERSATION_HASH["MSGS"] = new Object(); // [GUID] -> Msgs Hash
CONVERSATION_HASH["PLACE"] = new Object();


// Immutable Session Cache (maybe be replaced by HTML5 IndexDB later)
var IMMUTABLE_HASH = new Object();
IMMUTABLE_HASH["MSG"] = new Object(); // [GUID] -> { place, text, source, conversation, destination, img }
IMMUTABLE_HASH["PERSON"] = new Object();
IMMUTABLE_HASH["PLACE"] = new Object();
IMMUTABLE_HASH["IMAGE"] = new Object();

var BREADCRUMB_POLLING_WORKERS_HASH = new Object();


function add_to_critical_list(guid, msg){
  $("#critical_list header").after(
    '<div class="critical_msg">'+
    '<input type="hidden" class="Conversation_GUID" value="'+guid+'">'+msg+'</div>'
  );
}



function prepare_person(person_guid){
  if(IMMUTABLE_HASH["PERSON"].hasOwnProperty(person_guid)) { return false; }
  sd_get(
    "properties",
    { GUID: person_guid, depth: 0 },
    function(rcv_data){
      IMMUTABLE_HASH["PERSON"][person_guid] =
      {
        label: rcv_data.object.label
      }
    }
  );
}

function prepare_msg(msg_guid){
  if(IMMUTABLE_HASH["MSG"].hasOwnProperty(msg_guid)) { return false; }
  sd_get(
    "properties",
    { GUID: msg_guid, depth: 1 },
    function(rcv_data){
      // Check if any place or image is associated to the msg
      var place_guid, img_guid;
      for(var i=1; i<2; ++i){ // skip i=0 because it points to the msg itself        
        try{
          if(rcv_data.associated_objects[1].objects[i][0] == "Place"){
            place_guid = rcv_data.associated_objects[1].objects[i][1].placeId;
            if(!IMMUTABLE_HASH["PLACE"].hasOwnProperty(place_guid)){
              IMMUTABLE_HASH["PLACE"][place_guid] =
              {
                label: rcv_data.associated_objects[1].objects[i][1].label,
                latitude: rcv_data.associated_objects[1].objects[i][1].latitude, 
                longitude: rcv_data.associated_objects[1].objects[i][1].longitude
              };
            }
            // Check if the Conversation is already assigned a place
            if(!CONVERSATION_HASH["PLACE"].hasOwnProperty(rcv_data.object.conversationResourceId)){
              CONVERSATION_HASH["PLACE"][rcv_data.object.conversationResourceId] = 
              {
                latitude: rcv_data.associated_objects[1].objects[i][1].latitude, 
                longitude: rcv_data.associated_objects[1].objects[i][1].longitude
              }
            }
          } else if(rcv_data.associated_objects[1].objects[i][0] == "Image"){
            img_guid = rcv_data.associated_objects[1].objects[i][1].imageId;
            if(!IMMUTABLE_HASH["IMAGE"].hasOwnProperty(img_guid)){
              IMMUTABLE_HASH["IMAGE"][img_guid] = 
              {
                label: rcv_data.associated_objects[1].objects[i][1].label
              };
            }
          }
        } catch(err) { console.log(err);}
      }
    
      IMMUTABLE_HASH["MSG"][msg_guid] = 
      {
        text: rcv_data.object.payload,
        source: rcv_data.object.fromResourceId,
        destination: rcv_data.object.toResourceId,
        conversation: rcv_data.object.conversationResourceId,
        datetime: rcv_data.object.dateTime,
        place: place_guid,
        img: img_guid
      };
      // Finally Prepare Person
      prepare_person(rcv_data.object.fromResourceId);
    }
  );
}

function prepare_conversation(conversation_guid){
  sd_get(
    "properties",
    { GUID: conversation_guid, depth: 1 },
    function(rcv_data){
      CONVERSATION_HASH["LABELS"][conversation_guid] = rcv_data.object.label;
      // iterate through msgs
      CONVERSATION_HASH["MSGS"][conversation_guid] = new Object();
      $(rcv_data.associated_objects[0][1]).each( function(){
        CONVERSATION_HASH["MSGS"][conversation_guid][this.resourceID] = true;
        prepare_msg(this.resourceId);
      });
      //console.log(IMMUTABLE_HASH["PERSON"]["d462214e-18b7-11e2-93d7-7071bc51ad1f"]);
    }
  );
}






function polling_conversation_guid(conversation_guid){  
  // Create polling workers for one Conversation
  CONVERSATION_HASH["POLLING_WORKERS"][conversation_guid] = new Worker('polling_workers/polling_worker.js');
  CONVERSATION_HASH["POLLING_WORKERS"][conversation_guid].addEventListener(
    'message',
    function(e){
      var rcv_json = $.parseJSON(e.data);
      console.log(rcv_json);
      // if Conversation is new/updated and not ignored.
      if (CONVERSATION_HASH["STATUS"][conversation_guid] != rcv_json.object.lastUpdated && CONVERSATION_HASH["STATUS"][conversation_guid] != "Ignore"){
        console.log("new or updated conversation: "+conversation_guid);
        CONVERSATION_HASH["STATUS"][conversation_guid] = rcv_json.object.lastUpdated;
        add_to_critical_list(conversation_guid, "<b>Conversation</b>:<br> "+rcv_json.object.label);
      }
    },
    false
  );
  CONVERSATION_HASH["POLLING_WORKERS"][conversation_guid].postMessage(
    {type: "Conversation", interval: CONVERSATION_POLL_INTERVAL, GUID: conversation_guid}
  ); 
}



// Main Function
function initialize() {
  // Register Hyperwall on SDB

  if(typeof(Storage)!=="undefined"){
    console.log("HTML5 Local Storage Supported");
    // Temporary give a dedicated GUID
    localStorage['HYPERWALL_USER_GUID'] = "7d8689c0-1829-11e2-abd6-7071bc51ad1f"; 
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
        if(!CONVERSATION_HASH["STATUS"].hasOwnProperty(rcv_json.GUIDs[i])){
          console.log("Received new conversation: "+rcv_json.GUIDs[i])
          CONVERSATION_HASH["STATUS"][rcv_json.GUIDs[i]] = true;
          polling_conversation_guid(rcv_json.GUIDs[i]);
        }        
      }
    },
    false
  );
  guids_polling_worker.postMessage( {type: "Conversation_GUIDs", interval: CONVERSATION_GUIDS_POLL_INTERVAL}); 

  
  // Mockup & Response Test
  test_guid = "d5a7d648-1a38-11e2-8473-7071bc51ad1f"
  CONVERSATION_HASH["MAP_MARKERS"][test_guid] = gm_create_marker("test", [37.410425,-122.059754]);

  var test_info_str = "";
  sd_get(
    "properties",
    { GUID: test_guid, depth: 1 },
    function(rcv_data){
      console.log(rcv_data);
      test_info_str =
        '<div class="inmap_dialog"><h1 class="dialog_title">'+rcv_data.object.label+'</h1>'+
        '<input type="hidden" class="Conversation_GUID" value="'+test_guid+'">'+

        '<div class="dialog_pics">'+
        '<div class="dialog_pic"><input type="hidden" class="msg_GUID"><div class="dialog_pic_title"><a href="#" class="dialog_pic_user">Anonymous</a> @ MM:SS</div>'+
        '<img src="http://www.wolfforthfireems.com/images/gallery/20080324_live_fire_04.jpg"></div></div>'+

        '<div class="dialog_texts">';
        
      $(rcv_data.associated_objects[0][1]).each( function(){ 
        test_info_str += '<hr><input type="hidden" class="msg_GUID">'+
        '<div class="dialog_text_title">By <a href="#" class="dialog_text_user">Anonymous</a> @ '+
        this.dateTime.slice(11,-1)+'</div><div class="dialog_text">'+this.payload+'</div>';
      });

      test_info_str += '<input type="text" class="response_text" style="width: 100%">'+
      '<button class="more_info_btn">More Info</button> </div></div>';
      
  
      

      CONVERSATION_HASH["INFO_WINDOWS"][test_guid] = new google.maps.InfoWindow({ content: test_info_str });
      google.maps.event.addListener(CONVERSATION_HASH["MAP_MARKERS"][test_guid], 'click', function() {
        MAP.setZoom(17);
        CONVERSATION_HASH["INFO_WINDOWS"][test_guid].open(MAP, CONVERSATION_HASH["MAP_MARKERS"][test_guid]);
      });


    }
  );

  


  $('body').on("click", "#tracked_user_list a", function(){  
  //  console.log("click");
    //remove a marker
    //CONVERSATION_HASH["MAP_MARKERS"][test_guid].setMap(null);   
    //insert something according to guid
    //$('input[value="'+test_guid+'"]').after("test");

    //prepare_conversation(test_guid);
    $.when(prepare_conversation(test_guid)).then(function(resp){
      console.log(IMMUTABLE_HASH["PERSON"]["d462214e-18b7-11e2-93d7-7071bc51ad1f"]);
    });
  });  

  
  $('#map_canvas').on("click", ".more_info_btn", function(){
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


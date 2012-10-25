// Global Google Map variables
var MAP;
  
// Global Hyperwall variables
var CONVERSATIONS_POLL_INTERVAL = 50000, CRUMB_POLL_INTERVAL = 2000;
var CONVERSATIONS_POLLING_WORKER;
var BREADCRUMB_POLLING_WORKERS_HASH = new Object();

var HYPERWALL_USER_GUID = "";
var SPECIAL_USERS = new Array();


// Conversation Properties Hashes
var CONVERSATION_HASH = new Object();
//CONVERSATION_HASH["STATUS"] = new Object(); // [GUID] -> lastUpdated or "Ignore"
//CONVERSATION_HASH["MAP_MARKERS"] = new Object(); // [GUID] -> Map Marker
//CONVERSATION_HASH["INFO_WINDOWS"] = new Object(); // [GUID] -> Info Window
//CONVERSATION_HASH["LABELS"] = new Object(); // [GUID] -> Label



// Immutable Session Cache (maybe be replaced by HTML5 IndexDB later)
var IMMUTABLE_HASH = new Object();
IMMUTABLE_HASH["MSG"] = new Object(); // Special Hash for MSGs - [GUID] -> { place, text, source, conversation, destination, img }




// HTML MANIPULATION Functions
function add_to_list(type, guid, msg){
  $("#"+type+"_list header").after(
    '<div class="list_msg">'+
    '<input type="hidden" class="conversation_guid" value="'+guid+'">'+msg+'</div>'
  );
}

function insert_msg(conversation_guid, msg_guid){

  var target_container = $(".inmap_dialog .conversation_guid[value="+conversation_guid+"]").parent();
  console.log(target_container);
  /*if(IMMUTABLE_HASH["MSG"][msg_guid]["img"] != null){
    console.log("we have some pictures!")
  }*/

  var text_str =
    '<hr><input type="hidden" class="msg_guid">'+
    '<div class="dialog_text_title">By <a href="#" class="dialog_text_user">';
  //$.when( get_immutable(IMMUTABLE_HASH["MSG"][msg_guid]["fromResourceId"]) ).then(function(res){
    text_str += IMMUTABLE_HASH[IMMUTABLE_HASH["MSG"][msg_guid]["fromResourceId"]]["label"];
    text_str +=
      '</a> @ '+IMMUTABLE_HASH["MSG"][msg_guid]["dateTime"].slice(11,-1)+
      '</div><div class="dialog_text">'+IMMUTABLE_HASH["MSG"][msg_guid]["payload"]+'</div>';
  
    target_container.find('.dialog_texts').prepend(text_str);

  //});
}



// INFRASTRUCTURE THINGS

function get_immutable(guid){
  return IMMUTABLE_HASH[guid] ||
  sd_get(
    "properties", { GUID: guid, depth: 0 },
    function(rcv_data){ IMMUTABLE_HASH[guid] = rcv_data.object; }
  );
}

function prepare_msg(msg_guid){
  return sd_get(
    "properties", { GUID: msg_guid, depth: 1 },
    function(rcv_data){
      // Check if any place or image is associated to the msg
      var place_guid, img_guid;
      for(var i=1; i<2; ++i){ // skip i=0 because it points to the msg itself        
        try{
          if(rcv_data.associated_objects[1].objects[i][0] == "Place"){
            place_guid = rcv_data.associated_objects[1].objects[i][1].placeId;
            // Check if the Conversation is already assigned a place
            if(!CONVERSATION_HASH[rcv_data.object.conversationResourceId].hasOwnProperty("MAP_MARKER") ){
              CONVERSATION_HASH[rcv_data.object.conversationResourceId]["MAP_MARKER"] = gm_create_marker(
                "Conversation", 
                [rcv_data.associated_objects[1].objects[i][1].latitude, rcv_data.associated_objects[1].objects[i][1].longitude]
              );
            }
          } else if(rcv_data.associated_objects[1].objects[i][0] == "Image"){
            img_guid = rcv_data.associated_objects[1].objects[i][1].imageId;
          }
        } catch(err) { console.log(err);}
      }

      IMMUTABLE_HASH["MSG"][msg_guid] = 
      {
        "payload": rcv_data.object.payload,
        "fromResourceId": rcv_data.object.fromResourceId,
        "toResourceId": rcv_data.object.toResourceId,
        "conversationResourceId": rcv_data.object.conversationResourceId,
        "dateTime": rcv_data.object.dateTime,
        "place": place_guid,
        "img": img_guid
      };

    }
  );
}

function prepare_conversation(conversation_guid){
  return sd_get(
    "properties", { GUID: conversation_guid, depth: 1 },
    function(rcv_data){
      CONVERSATION_HASH[conversation_guid]["LABEL"] = rcv_data.object.label;
      // iterate through msgs
      CONVERSATION_HASH[conversation_guid]["MSGS"] = new Array(); // reserve time order 
      CONVERSATION_HASH[conversation_guid]["MSGS_HASH"] = new Object(); // for quick check of existence
      $(rcv_data.associated_objects[0][1]).each( function(){
        CONVERSATION_HASH[conversation_guid]["MSGS"].push(this.resourceId);
        CONVERSATION_HASH[conversation_guid]["MSGS_HASH"][this.resourceId] = true;
      });
    }
  );
}


function construct_conversation(conversation_guid){
  $.when( prepare_conversation(conversation_guid)
  ).done( function(){

    var msg_requests_array = $.map(CONVERSATION_HASH[conversation_guid]["MSGS"], function(val, i) {
      return prepare_msg(val);
    });

    $.when.apply(null, msg_requests_array).done( function(){
      var info_str =
        '<div class="inmap_dialog"><h1 class="dialog_title">'+CONVERSATION_HASH[conversation_guid]["LABEL"]+'</h1>'+
        '<input type="hidden" class="conversation_guid" value="'+conversation_guid+'">'+
          '<div class="dialog_pics"></div>'+
          '<div class="dialog_texts"></div>'+
        '<input type="text" class="response_text">'+
        '<button class="more_info_btn">More Info</button></div>';
    
      // Check if Place information is available
      if(CONVERSATION_HASH[conversation_guid].hasOwnProperty("MAP_MARKER")){
        $("#conversations_with_no_place").append(info_str);
        CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"] = new google.maps.InfoWindow({ content: "" });
        google.maps.event.addListener(CONVERSATION_HASH[conversation_guid]["MAP_MARKER"], 'click', function() {
          MAP.setZoom(17);
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].setContent(
            $(".inmap_dialog .conversation_guid[value="+conversation_guid+"]").parent().parent().html()
          );
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].open(MAP, CONVERSATION_HASH[conversation_guid]["MAP_MARKER"]);
        });
      } else {
        $("#conversations_with_no_place").append(info_str);
      }

      // Prepare for person labels
      var person_requests_array = $.map(CONVERSATION_HASH[conversation_guid]["MSGS"], function(val, i) {
        return get_immutable(IMMUTABLE_HASH["MSG"][val]["fromResourceId"]);
      });
      $.when.apply(null, person_requests_array).done( function(){
        for(var i=CONVERSATION_HASH[conversation_guid]["MSGS"].length-1; i>=0; --i){
          insert_msg(conversation_guid, CONVERSATION_HASH[conversation_guid]["MSGS"][i] );
        }      
      });

    });

  });
    
}



// Main Function
function initialize() {
  // Register Hyperwall on Situation DB
  if(typeof(Storage)!=="undefined"){
    console.log("HTML5 Local Storage Supported");
    // Temporary give a dedicated GUID
    localStorage['HYPERWALL_USER_GUID'] = "7d8689c0-1829-11e2-abd6-7071bc51ad1f"; 
    if(localStorage['HYPERWALL_USER_GUID'] == undefined){
      console.log("Register New Hyperwall GUID");
      sd_create(
        "people", { label: "HyperWall_User" },
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
  CONVERSATIONS_POLLING_WORKER = new Worker('polling_workers/polling_worker.js');
  CONVERSATIONS_POLLING_WORKER.addEventListener(
    'message',
    function(e){
      // Receive Conversation GUIDs from Server
      var rcv_json = $.parseJSON(e.data);
      console.log(rcv_json);
      for(var i=0; i<rcv_json.objects.length; ++i){
        // Ckeck if it is ignored or updated
        if( CONVERSATION_HASH.hasOwnProperty(rcv_json.objects[i].resourceId) ) {
          if( CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] != "IGNORED" ){
            if( CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] != rcv_json.objects[i].lastUpdated ){
              console.log("Conversation updated: "+rcv_json.objects[i].resourceId);
              //do something for updated conversation
              CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] = rcv_json.objects[i].lastUpdated;
            }
          }
        } else {
          // Initialize a New Conversation
          console.log("Received new conversation: "+rcv_json.objects[i].resourceId);
          CONVERSATION_HASH[rcv_json.objects[i].resourceId] = new Object();
          CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] = rcv_json.objects[i].lastUpdated;
          add_to_list("general", rcv_json.objects[i].resourceId, "<b>Conversation</b>:<br> "+rcv_json.objects[i].label);
          construct_conversation(rcv_json.objects[i].resourceId);
        }
      }
    },
    false
  );
  CONVERSATIONS_POLLING_WORKER.postMessage( {type: "Conversations", interval: CONVERSATIONS_POLL_INTERVAL}); 


  // test space
  //test_guid = "d5a7d648-1a38-11e2-8473-7071bc51ad1f"
  //CONVERSATION_HASH[test_guid] = new Object();
  //construct_conversation(test_guid);


/*
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
*/
  


  $('body').on("click", "#tracked_user_list a", function(){  
  //  console.log("click");
    //remove a marker
    //CONVERSATION_HASH["MAP_MARKERS"][test_guid].setMap(null);   
    //insert something according to guid
    //$('input[value="'+test_guid+'"]').after("test");

    //prepare_conversation(test_guid);
    //$.when(prepare_conversation(test_guid)).then(function(resp){
    //  console.log(IMMUTABLE_HASH["PERSON"]["d462214e-18b7-11e2-93d7-7071bc51ad1f"]);
    //});
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


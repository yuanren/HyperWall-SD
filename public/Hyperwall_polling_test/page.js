// Global Google Map variables
var MAP;
  
// Global Hyperwall variables
var CONVERSATIONS_POLL_INTERVAL = 5000, CRUMB_POLL_INTERVAL = 2000;
var CONVERSATIONS_POLLING_WORKER;
var BREADCRUMB_POLLING_WORKERS_HASH = new Object();
var POLLING_THREADS = 5;

var HYPERWALL_USER_GUID = "";
var SPECIAL_USERS = new Array();


// Conversation Properties Hashes
var CONVERSATION_HASH = new Object();

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
  //return IMMUTABLE_HASH[guid] ||
  return sd_get(
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
            //if(!CONVERSATION_HASH[rcv_data.object.conversationResourceId].hasOwnProperty("MAP_MARKER") ){
              CONVERSATION_HASH[rcv_data.object.conversationResourceId]["MAP_MARKER"] = gm_create_marker(
                "Conversation", 
                [rcv_data.associated_objects[1].objects[i][1].latitude, rcv_data.associated_objects[1].objects[i][1].longitude]
              );
            //}
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
        //CONVERSATION_HASH[conversation_guid]["MSGS"].push(this.resourceId);
        CONVERSATION_HASH[conversation_guid]["MSGS_HASH"][this.resourceId] = true;
      });
    }
  );
}


function update_conversation(conversation_guid){
  var new_msg_guids = new Array();
  $.when( 
    sd_get(
      "properties", { GUID: conversation_guid, depth: 1 },
      function(rcv_data){
        // iterate through msgs
        $(rcv_data.associated_objects[0][1]).each( function(){
          if(!CONVERSATION_HASH[conversation_guid]["MSGS_HASH"].hasOwnProperty(this.resourceId)){
            new_msg_guids.push(this.resourceId);
            CONVERSATION_HASH[conversation_guid]["MSGS"].push(this.resourceId);  
            CONVERSATION_HASH[conversation_guid]["MSGS_HASH"][this.resourceId] = true;
          }
        });
      }
    )
  ).done( function(){

    var msg_requests_array = $.map(new_msg_guids, function(val, i) {
      return prepare_msg(val);
    });

    $.when.apply(null, msg_requests_array).done( function(){
      
      // Check if Place information is available
      if(CONVERSATION_HASH[conversation_guid].hasOwnProperty("MAP_MARKER")){
        CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"] = new google.maps.InfoWindow({ content: "" });
        google.maps.event.addListener(CONVERSATION_HASH[conversation_guid]["MAP_MARKER"], 'click', function() {
          MAP.setZoom(17);
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].setContent(
            '<div class="inmap_dialog">'+
            $("#conversations_pool .inmap_dialog .conversation_guid[value="+conversation_guid+"]").html()+
            '</div>'
          );
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].open(MAP, CONVERSATION_HASH[conversation_guid]["MAP_MARKER"]);
        });
      }

      // Prepare for person labels
      var person_requests_array = $.map(new_msg_guids, function(val, i) {
        return get_immutable(IMMUTABLE_HASH["MSG"][val]["fromResourceId"]);
      });
      $.when.apply(null, person_requests_array).done( function(){
        for(var i=new_msg_guids.length-1; i>=0; --i){
          insert_msg(conversation_guid, new_msg_guids[i] );
        }      
      });

    });

  });
    
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
          '<div class="dialog_pics"></div><div class="dialog_texts"></div><br>'+
        '<button class="ignore_btn">Ignore</button><button class="escalate_btn">Escalate</button>'+
        '<input type="text" class="response_text">'+
        '<button class="more_info_btn">More Info</button></div>';
    
      // Check if Place information is available
      if(CONVERSATION_HASH[conversation_guid].hasOwnProperty("MAP_MARKER")){
        $("#conversations_pool").append(info_str);
        CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"] = new google.maps.InfoWindow({ content: "" });
        google.maps.event.addListener(CONVERSATION_HASH[conversation_guid]["MAP_MARKER"], 'click', function() {
          MAP.setZoom(17);
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].setContent(
            '<div class="inmap_dialog" style="display: inline">'+
            $("#conversations_pool .inmap_dialog .conversation_guid[value="+conversation_guid+"]").parent().html()+
            '</div>'
          );
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].open(MAP, CONVERSATION_HASH[conversation_guid]["MAP_MARKER"]);
        });
      } else {
        $("#conversations_pool").append(info_str);
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
  /*if(typeof(Storage)!=="undefined"){
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
  }*/
  HYPERWALL_USER_GUID = "7d8689c0-1829-11e2-abd6-7071bc51ad1f";

  // Construct Google Map
  MAP = new google.maps.Map(
    document.getElementById('map_canvas'), 
    { zoom: 15, center: new google.maps.LatLng(37.410425,-122.059754), mapTypeId: google.maps.MapTypeId.ROADMAP }
  );

  // Start conversation polling worker thread
  CONVERSATIONS_POLLING_WORKER = new Array();
  for(var j=0; j<POLLING_THREADS; ++j){
    CONVERSATIONS_POLLING_WORKER[j] = new Worker('polling_worker.js');
    CONVERSATIONS_POLLING_WORKER[j].addEventListener(
      'message',
      function(e){
        // Receive Conversation GUIDs from Server
        var rcv_json = $.parseJSON(e.data);
        console.log(rcv_json);
        for(var i=0; i<rcv_json.objects.length; ++i){
        // Ckeck if it is ignored or updated
        /*if( CONVERSATION_HASH.hasOwnProperty(rcv_json.objects[i].resourceId) ) {
          if( CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] != "IGNORED" ){
            if( CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] != rcv_json.objects[i].lastUpdated ){
              console.log("Conversation updated: "+rcv_json.objects[i].resourceId);
              //do something for updated conversation
              CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] = rcv_json.objects[i].lastUpdated;
              add_to_list("general", rcv_json.objects[i].resourceId, "<b>Conversation Updated</b>:<br> "+rcv_json.objects[i].label);
              update_conversation(rcv_json.objects[i].resourceId);
            }
          }
        } else {*/
          // Initialize a New Conversation
          console.log("Received new conversation: "+rcv_json.objects[i].resourceId);
          CONVERSATION_HASH[rcv_json.objects[i].resourceId] = new Object();
          CONVERSATION_HASH[rcv_json.objects[i].resourceId]["STATUS"] = rcv_json.objects[i].lastUpdated;
          //add_to_list("general", rcv_json.objects[i].resourceId, "<b>New Conversation</b>:<br> "+rcv_json.objects[i].label);
          construct_conversation(rcv_json.objects[i].resourceId);
        //}
        }
      },
      false
    );
    CONVERSATIONS_POLLING_WORKER[j].postMessage( {type: "Conversations", interval: CONVERSATIONS_POLL_INTERVAL}); 
  }



  // UI Behavior Related
  $("#map_canvas").on("DOMNodeInserted", function(e){
    var targetElements = $(e.target).find('.inmap_dialog');
    targetElements.parent().parent().parent().css('box-shadow', '1px 1px 10px 5px #c42c2b');
  });

  $("#general_list").on("click", ".list_msg", function(event){
    var conversation_guid = $(this).find(".conversation_guid").val();
    if(CONVERSATION_HASH[conversation_guid].hasOwnProperty("MAP_MARKER")){
      MAP.setZoom(17);
      CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].setContent(
        '<div class="inmap_dialog" style="display: inline">'+
        $("#conversations_pool .inmap_dialog .conversation_guid[value="+conversation_guid+"]").parent().html()+
        '</div>'
      );
      CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].open(MAP, CONVERSATION_HASH[conversation_guid]["MAP_MARKER"]);
    } else {
      $("#conversations_pool .inmap_dialog").hide();
      $("#conversations_pool .conversation_guid[value="+conversation_guid+"]").parent().show();
      $("#conversations_pool").fadeIn();
    }
  });

  $('body').on("click", ".more_info_btn", function(){
    sd_create(
      "messages",
      { 
        text: $(this).parent().find(".response_text").val(),
        sender: HYPERWALL_USER_GUID, recipient: "",
        "conversation": $(this).parent().find(".conversation_guid").val()
      }
    );
  }); 

  $('#conversations_pool').on("click", "#pool_close_btn", function(){
    $('#conversations_pool').fadeOut();
  }); 


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


}


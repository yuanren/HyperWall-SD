// Define root directory
var APP_ROOT_DIRECTORY = "../";

// Global Google Map variables
var MAP;
  
// Global Hyperwall variables
var CONVERSATIONS_POLL_INTERVAL = 2100, BREADCRUMB_POLL_INTERVAL = 3999;
var CONVERSATIONS_POLLING_WORKER;

var BREADCRUMB_POLLING_WORKERS = new Object();
var BREADCRUMB_MAP_MARKERS = new Object(); //key = timestamp


var HYPERWALL_USER_GUID = "";

var SELF_ESCALATION_LEVEL = 2;
var CRITICAL_CONVERSATIONS_HASH = new Object();


// Conversation Properties Hashes
var CONVERSATION_HASH = new Object();
// Immutable Session Cache (maybe be replaced by HTML5 IndexDB later)
var IMMUTABLE_HASH = new Object();
IMMUTABLE_HASH["MSG"] = new Object(); // Special Hash for MSGs - [GUID] -> { place, text, source, conversation, destination, img }




// HTML MANIPULATION Functions
function clear_breadcrumb(){
  $.each(BREADCRUMB_MAP_MARKERS, function(index, value) { value.setMap(null); });
  $('.inmap_dialog .user_guid').parent().parent().removeClass("same_user_frame");
  BREADCRUMB_MAP_MARKERS = new Object();
  BREADCRUMB_POLLING_WORKERS[0].postMessage({type: "STOP"}); 
}


function add_to_list(type, guid, msg){
  $("#"+type+"_list header").after(
    '<div class="list_msg">'+
    '<input type="hidden" class="conversation_guid" value="'+guid+'">'+msg+'</div>'
  ).hide().fadeIn();
}

function make_critical(guid){
  CRITICAL_CONVERSATIONS_HASH[guid] = true;
  $(".list_msg .conversation_guid[value="+guid+"]").parent().appendTo('#critical_list');
  if(CONVERSATION_HASH[guid].hasOwnProperty("MAP_MARKER")){
    CONVERSATION_HASH[guid]["MAP_MARKER"].setIcon("http://maps.google.com/mapfiles/ms/icons/orange-dot.png");
  }
}

function insert_msg(conversation_guid, msg_guid){
// TODO: CHANGE TIME FROM UTC TO LOCAL
  var target_container = $(".inmap_dialog .conversation_guid[value="+conversation_guid+"]").parent();
  var img_count = $(".inmap_dialog .dialog_pic .msg_guid[value="+msg_guid+"]").length;

  if(IMMUTABLE_HASH["MSG"][msg_guid]["img"] != null && img_count == 0){
    console.log("we have some pictures!");
    var pic_str =
    '<div class="dialog_pic"><input type="hidden" class="msg_guid" value="'+msg_guid+'">'+
    '<div class="dialog_pic_title"><a href="#" class="dialog_pic_user user_link">'+
    IMMUTABLE_HASH[IMMUTABLE_HASH["MSG"][msg_guid]["fromResourceId"]]["label"]+
    '<input type="hidden" class="user_guid" value="'+IMMUTABLE_HASH["MSG"][msg_guid]["fromResourceId"]+'">'+
    '</a> @ '+IMMUTABLE_HASH["MSG"][msg_guid]["dateTime"].slice(11,-1)+' UTC</div>'+
    '<img src="'+APP_ROOT_DIRECTORY+'Images/'+IMMUTABLE_HASH["MSG"][msg_guid]["img"]+'"></div>';

    target_container.find('.dialog_pics').prepend(pic_str).hide().fadeIn();
  }

  var text_count = $(".inmap_dialog .dialog_texts .msg_guid[value="+msg_guid+"]").length;

  if(text_count == 0){
  var text_str =
    '<hr><input type="hidden" class="msg_guid" value="'+msg_guid+'">'+
    '<div class="dialog_text_title">By <a href="#" class="dialog_text_user user_link">';
  //$.when( get_immutable(IMMUTABLE_HASH["MSG"][msg_guid]["fromResourceId"]) ).then(function(res){
    text_str += IMMUTABLE_HASH[IMMUTABLE_HASH["MSG"][msg_guid]["fromResourceId"]]["label"];
    text_str += '<input type="hidden" class="user_guid" value="'+IMMUTABLE_HASH["MSG"][msg_guid]["fromResourceId"]+'">'+
      '</a> @ '+IMMUTABLE_HASH["MSG"][msg_guid]["dateTime"].slice(11,-1)+' UTC'+
      '</div><div class="dialog_text">'+IMMUTABLE_HASH["MSG"][msg_guid]["payload"]+'</div>';
  
    target_container.find('.dialog_texts').prepend(text_str).hide().fadeIn();
  }
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
              CONVERSATION_HASH[rcv_data.object.conversationResourceId]["MAP_MARKER_TIME"] = rcv_data.object.dateTime;
            } else if (CONVERSATION_HASH[rcv_data.object.conversationResourceId]["MAP_MARKER_TIME"] > rcv_data.object.dateTime){
              CONVERSATION_HASH[rcv_data.object.conversationResourceId]["MAP_MARKER"].setMap(null);
              CONVERSATION_HASH[rcv_data.object.conversationResourceId]["MAP_MARKER"] = gm_create_marker(
                "Conversation", 
                [rcv_data.associated_objects[1].objects[i][1].latitude, rcv_data.associated_objects[1].objects[i][1].longitude]
              );
              CONVERSATION_HASH[rcv_data.object.conversationResourceId]["MAP_MARKER_TIME"] = rcv_data.object.dateTime;  
            }
          } else if(rcv_data.associated_objects[1].objects[i][0] == "Image"){
            img_guid = rcv_data.associated_objects[1].objects[i][1].resourceId;
          }
        } catch(e) { console.log(e);}
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
          } else { new_msg_guids.push(this.resourceId); }
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
          google.maps.event.addListener(CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"],'closeclick',function(){
            if(BREADCRUMB_POLLING_WORKERS.hasOwnProperty(0)){ clear_breadcrumb(); };
          });          
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
        '<input type="text" class="response_text"><button class="more_info_btn">More Info</button>'+
        '<div class="file_div"><input type="file" class="img_file"></div></div>';
    
      // Check if Place information is available
      if(CONVERSATION_HASH[conversation_guid].hasOwnProperty("MAP_MARKER")){
        $("#conversations_pool").append(info_str);
        CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"] = new google.maps.InfoWindow();
        google.maps.event.addListener(CONVERSATION_HASH[conversation_guid]["MAP_MARKER"], 'click', function() {
          MAP.setZoom(17);
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].setContent(
            '<div class="inmap_dialog" style="display: inline">'+
            $("#conversations_pool .inmap_dialog .conversation_guid[value="+conversation_guid+"]").parent().html()+
            '</div>'
          );
          CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].open(MAP, CONVERSATION_HASH[conversation_guid]["MAP_MARKER"]);
          google.maps.event.addListener(CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"],'closeclick',function(){
            if(BREADCRUMB_POLLING_WORKERS.hasOwnProperty(0)){ clear_breadcrumb(); };
          });
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
  if(typeof(Storage)!=="undefined"){
    console.log("HTML5 Local Storage Supported");
    // Temporary give a dedicated GUID
    localStorage['HYPERWALL_USER_GUID'] = "I-32e88366-2187-11e2-bb58-0800271d4f59"; 
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
  } else { HYPERWALL_USER_GUID = "I-32e88366-2187-11e2-bb58-0800271d4f59"; } // Temporary give a dedicated GUID


  // Construct Google Map
  MAP = new google.maps.Map(
    document.getElementById('map_canvas'), 
    { zoom: 15, center: new google.maps.LatLng(37.410425,-122.059754), mapTypeId: google.maps.MapTypeId.ROADMAP }
  );


  // Start conversation polling worker thread
  CONVERSATIONS_POLLING_WORKER = new Worker('polling_workers/conversations_worker.js');
  CONVERSATIONS_POLLING_WORKER.addEventListener(
    'message',
    function(e){
      // Receive Conversation GUIDs from Server
      var rcv_json = $.parseJSON(e.data);
      console.log(rcv_json);
      for(var i=0; i<rcv_json.length; ++i){
        var current_obj = rcv_json[i].objects[0][1];
        // Ckeck if it is ignored or updated
        if( CONVERSATION_HASH.hasOwnProperty(current_obj.resourceId) ) {
          if( CONVERSATION_HASH[current_obj.resourceId]["STATUS"] != "IGNORED" ){
            if( CONVERSATION_HASH[current_obj.resourceId]["STATUS"] != current_obj.lastUpdated ){
              console.log("Conversation updated: "+current_obj.resourceId);
              //do something for updated conversation
              CONVERSATION_HASH[current_obj.resourceId]["STATUS"] = current_obj.lastUpdated;
              $(".list_msg .conversation_guid[value="+current_obj.resourceId+"]").parent().remove();
              var list_type = CRITICAL_CONVERSATIONS_HASH.hasOwnProperty(current_obj.resourceId)? "critical":"general";
              add_to_list(list_type, current_obj.resourceId, "<b>Conversation Updated</b>:<br> "+current_obj.label+'<br>@'+current_obj.lastUpdated.slice(11,-1)+' UTC');
              update_conversation(current_obj.resourceId);
            }
          }
        } else {
          // Initialize a New Conversation
          console.log("Received new conversation: "+current_obj.resourceId);
          CONVERSATION_HASH[current_obj.resourceId] = new Object();
          CONVERSATION_HASH[current_obj.resourceId]["STATUS"] = current_obj.lastUpdated;
          add_to_list("general", current_obj.resourceId, "<b>New Conversation</b>:<br> "+current_obj.label+'<br>@'+current_obj.lastUpdated.slice(11,-1)+' UTC');
          construct_conversation(current_obj.resourceId);
        }
      }
    },
    false
  );
  CONVERSATIONS_POLLING_WORKER.postMessage( {type: "START", interval: CONVERSATIONS_POLL_INTERVAL}); 




// UI Behavior Related

  // Add red frame to dialog
  $("#map_canvas").on("DOMNodeInserted", function(e){
    var targetElements = $(e.target).find('.inmap_dialog');
    targetElements.parent().parent().parent().css('box-shadow', '1px 1px 10px 5px #c42c2b');
  });

  // list item triggers
  $("#general_list, #critical_list").on("click", ".list_msg", function(event){
    $(this).fadeTo("slow", 0.5);
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

  // User Trigger (Breadrumbs and mark all his/her msgs)
  $('body').on("click", ".user_link", function(){
    if(BREADCRUMB_POLLING_WORKERS.hasOwnProperty(0)){ clear_breadcrumb(); };

    var user_guid = $(this).parent().find(".user_guid").val();
    $(this).closest('.inmap_dialog').first().find('.user_guid[value='+user_guid+']').parent().parent().addClass("same_user_frame");

    BREADCRUMB_POLLING_WORKERS[0] = new Worker('polling_workers/breadcrumb_worker.js');
    BREADCRUMB_POLLING_WORKERS[0].addEventListener(
      'message',
      function(e){
        var rcv_json = $.parseJSON(e.data);
        console.log(rcv_json);
        for(var i=0; i<rcv_json.result.length; ++i){
          if(!BREADCRUMB_MAP_MARKERS.hasOwnProperty(rcv_json.result[i][3])){
            BREADCRUMB_MAP_MARKERS[rcv_json.result[i][3]] = gm_create_marker(
              "breadcrumb", 
              [rcv_json.result[i][1], rcv_json.result[i][2]]
            );
          }
        }
      },
      false
    );
    BREADCRUMB_POLLING_WORKERS[0].postMessage( {type: "START", object_guid: user_guid, interval: BREADCRUMB_POLL_INTERVAL}); 

  })

  // click on img function
  $('body').on("click", ".dialog_pic img", function(){
    console.log("click on img");
    $('#img_holder #enlarged_img').attr('src', $(this).attr('src'));
    $('#img_holder').fadeIn();
  });

  $('#img_holder').on("click", "#img_close_btn", function(){
    $('#img_holder').fadeOut();
  });



  // More info button
  $('body').on("click", ".more_info_btn", function(){
    var img_file = $(this).parent().find('.img_file')[0];
    var response_text = $(this).parent().find(".response_text").val();
    $.when( 
      sd_create(
        "messages",
        { 
          text: response_text,
          sender: HYPERWALL_USER_GUID, recipient: "",
          "conversation": $(this).parent().find(".conversation_guid").val()
        }
      )    
    ).done( function(msg_resp){
      
      var filereader = new FileReader();
      filereader.readAsDataURL(img_file.files[0]);
      filereader.onload = function (event) {
        try{ 
          //console.log(event.target.result);
          sd_create(
            "images",
            { binary: event.target.result, label: response_text },
            function(rcv_data){
              $.ajax({
                type: 'POST', url: APP_ROOT_DIRECTORY+"associate_guids",
                data: { objects: [msg_resp.GUID, rcv_data.GUID]}, dataType: 'json'
              }); 
            }
          );
        } catch(e) { console.log(e); }
      }
      
    });
    $(this).parent().find(".response_text").val("");

  }); 


  // Escalate button
  $('body').on("click", ".escalate_btn", function(){
    var conversation_guid = $(this).parent().find(".conversation_guid").val();
    sd_create(
      "escalations",
      { level: SELF_ESCALATION_LEVEL+1 },
      function(rcv_data) {
        $.ajax({
          type: 'POST', url: APP_ROOT_DIRECTORY+"associate_guids",
          data: { objects: [conversation_guid, rcv_data.GUID]}, dataType: 'json',
          success: function(rcv_data_2){ 
            console.log(rcv_data_2);
            make_critical(conversation_guid);
          }
        });
      }
    );
    
  }); 


  // Ignore button
  $('body').on("click", ".ignore_btn", function(){
    var conversation_guid = $(this).parent().find(".conversation_guid").val();
    CONVERSATION_HASH[conversation_guid]["STATUS"] = "IGNORED";
    if(CONVERSATION_HASH[conversation_guid].hasOwnProperty("MAP_MARKER")){
      CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].close();
      CONVERSATION_HASH[conversation_guid]["MAP_MARKER"].setMap(null);
    }
    $("#conversations_pool").fadeOut();
    $("#conversations_pool .conversation_guid[value="+conversation_guid+"]").parent().remove();
    $(".list_msg .conversation_guid[value="+conversation_guid+"]").parent().fadeOut().remove();
  }); 



  // Search Button
  $('#search_btn').click(function() {
    if( $('#search_text').val() != ""){
      $('.list_msg').removeClass("results_frame");
      $('.dialog_text').removeClass("results_frame");
      $.each(CONVERSATION_HASH, function() {
        if(this.hasOwnProperty("MAP_MARKER")){
          this["MAP_MARKER"].setIcon("http://maps.google.com/mapfiles/marker.png");
        }
      });
      sd_get(
        "guid", { type: "Conversation", valueRange: $("#search_text").val() },
        function(rcv_data){
          for(var i=0; i<rcv_data.GUIDs.length; ++i){
            $("#right_list_container .conversation_guid[value="+rcv_data.GUIDs[i]+"]").parent().addClass("results_frame");
            if(CONVERSATION_HASH[rcv_data.GUIDs[i]].hasOwnProperty("MAP_MARKER")){
              CONVERSATION_HASH[rcv_data.GUIDs[i]]["MAP_MARKER"].setIcon("http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
            }
          }
        }
      );
      sd_get(
        "objects", { type: "Message", valueRange: $("#search_text").val() },
        function(rcv_data){
          for(var i=0; i<rcv_data.objects.length; ++i){
            $("#right_list_container .conversation_guid[value="+rcv_data.objects[i].conversationResourceId+"]").parent().addClass("results_frame");
            $(".msg_guid[value="+rcv_data.objects[i].resourceId+"]").next().next().addClass("results_frame");
            if(CONVERSATION_HASH[rcv_data.objects[i].conversationResourceId].hasOwnProperty("MAP_MARKER")){
              CONVERSATION_HASH[rcv_data.objects[i].conversationResourceId]["MAP_MARKER"].setIcon("http://maps.google.com/mapfiles/ms/icons/blue-dot.png");
            }
          }
        }
      );
    }
  });
  $('#search_text').keyup(function(e) {
    if(e.which == 13){ $('#search_btn').trigger('click'); }
  });
  $('#search_clear_btn').click(function() {
    $('#search_text').val("");
    $('.list_msg').removeClass("results_frame");
    $('.dialog_text').removeClass("results_frame");
    $.each(CONVERSATION_HASH, function(key, value) {
      if(this.hasOwnProperty("MAP_MARKER")){
        if(CRITICAL_CONVERSATIONS_HASH.hasOwnProperty(key)){
          this["MAP_MARKER"].setIcon("http://maps.google.com/mapfiles/ms/icons/orange-dot.png");
        } else {
          this["MAP_MARKER"].setIcon("http://maps.google.com/mapfiles/marker.png");
        }
      }
    });
  });

  // Conversation pool section close
  $('#conversations_pool').on("click", "#pool_close_btn", function(){
    $('#conversations_pool').fadeOut();
    if(BREADCRUMB_POLLING_WORKERS.hasOwnProperty(0)){ clear_breadcrumb(); };
  }); 


  // Right Container Height
  $('#right_list_container').css('max-height', $('body').height()-64 + 'px'); 
  $('#conversations_pool, #img_holder').draggable();

  $('body').on("click", "#tracked_user_list a", function(){  
    //prepare_conversation(test_guid);
    //$.when(prepare_conversation(test_guid)).then(function(resp){
    //  console.log(IMMUTABLE_HASH["PERSON"]["d462214e-18b7-11e2-93d7-7071bc51ad1f"]);
    //});
  });  


}


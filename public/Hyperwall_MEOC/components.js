$(document).ready(function(){

  $("#map_canvas").on("DOMNodeInserted", function(e){
    var targetElements = $(e.target).find('.inmap_dialog');
    targetElements.parent().parent().parent().css('box-shadow', '1px 1px 10px 5px #c42c2b');
  });

  // UI Related
  $("#general_list").on("click", ".list_msg", function(event){
    var conversation_guid = $(this).find(".conversation_guid").val();
    if(CONVERSATION_HASH[conversation_guid].hasOwnProperty("MAP_MARKER")){
      MAP.setZoom(17);
      CONVERSATION_HASH[conversation_guid]["INFO_WINDOW"].setContent(
        '<div class="inmap_dialog">'+
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


});



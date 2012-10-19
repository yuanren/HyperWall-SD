$(document).ready(function(){
  $("#critical_list").css("left", ($("body").width()-224)+"px");
  $("#tracked_user_list").css("top", ($("body").height()-124)+"px");

  $("body").on("DOMNodeInserted", function(e){
    var targetElements = $(e.target).find('.inmap_dialog');
    console.log(targetElements);
    targetElements.parent().parent().parent().css('box-shadow', '1px 1px 10px 5px #c42c2b'); // do something
  });



});



$(document).ready(function(){
  console.log($("body").width()-200);
  $("#critical_list").css("left", ($("body").width()-204)+"px");
  $("#tracked_user_list").css("top", ($("body").height()-124)+"px");

});

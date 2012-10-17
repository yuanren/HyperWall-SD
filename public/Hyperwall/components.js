$(document).ready(function(){
  console.log($("body").width()-200);
  $("#critical_list").css("left", ($(document).width()-204)+"px");
  $("#tracked_user_list").css("top", ($(document).height()-$(this).height()-24)+"px");

});

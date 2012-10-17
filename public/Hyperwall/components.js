$(document).ready(function(){
  console.log($("body").width()-200);
  $("#critical_list").css("left", ($("html").width()-204)+"px");
  $("#tracked_user_list").css("top", ($("html").height()-$(this).height()-24)+"px");

});

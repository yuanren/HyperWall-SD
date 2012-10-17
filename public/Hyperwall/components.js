$(document).ready(function(){
  console.log($("body").width()-200);
  $("#critical_list").css("left", ($(body).width()-200)+"px");

});

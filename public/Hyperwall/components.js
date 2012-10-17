$(document).ready(function(){
  console.log($("body").width()-200);
  $(".list").css("left", ($(body).width()-200)+"px");

});

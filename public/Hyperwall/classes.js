






function bg_img(img_src, img_info, img_ratio, img_center) {
  this.src = img_src, this.info = img_info, this.ratio = img_ratio, this.center = img_center;
}
bg_img.prototype.get_src = function() { return this.src; }
bg_img.prototype.get_info = function() { return this.info; }
bg_img.prototype.get_ratio = function() { return this.ratio; }
bg_img.prototype.get_center = function() { return this.center; }


function tags_info() {
  this.name_type_hash = new Object(), this.type_color_hash = new Object();
  this.name_checked_hash = new Object(), this.name_pid_hash = new Object();
}
tags_info.prototype.insert_type = function(tag_type, tag_color, tags_list){
  for( var i=0; i < tags_list.length; i++) { 
    this.name_type_hash[tags_list[i]] = tag_type;
    this.name_checked_hash[tags_list[i]] = false;
    this.name_pid_hash[tags_list[i]] = new Array();
  }
  this.type_color_hash[tag_type] = tag_color;
}
tags_info.prototype.insert_pid = function(name, pid){ this.name_pid_hash[name].push(pid); }
tags_info.prototype.get_pid_list = function(name){ return this.name_pid_hash[name]; }
tags_info.prototype.get_name_type_hash = function() { return this.name_type_hash; }
tags_info.prototype.set_name_checked = function(type, name) {
  switch(type){
    case true:
      this.name_checked_hash[name] = true;
      break;
    case false:
      this.name_checked_hash[name] = false;
      break;
    case 'toggle':
      this.name_checked_hash[name] = !this.name_checked_hash[name];
      break;
    case 'all':
      for(var key in this.name_checked_hash){
        if(this.name_checked_hash.hasOwnProperty(key)) { this.name_checked_hash[key] = true; }
      }
      break;
    case 'none':
      for(var key in this.name_checked_hash){
        if(this.name_checked_hash.hasOwnProperty(key)) { this.name_checked_hash[key] = false; }
      }
      break;
  }
}
tags_info.prototype.get_name_checked = function(name) { return this.name_checked_hash[name]; }
tags_info.prototype.get_type = function(name) { return this.name_type_hash[name]; }
tags_info.prototype.get_color = function(type) { return this.type_color_hash[type]; }
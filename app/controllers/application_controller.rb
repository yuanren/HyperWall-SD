class ApplicationController < ActionController::Base
  protect_from_forgery
  before_filter :cor

  def cor
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Expose-Headers'] = 'ETag'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD'
    headers['Access-Control-Allow-Headers'] = '*, Origin, Accept, X-Requested-With, X-CSRF-Token, Content-Type, If-Modified-Since, If-None-Match'
    headers['Access-Control-Max-Age'] = '86400'
    head(:ok) if request.request_method == 'OPTIONS'
  end
end

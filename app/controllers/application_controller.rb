class ApplicationController < ActionController::Base
  protect_from_forgery

  def current_user
    @current_user
  end

  def authenticate_session!
    if !params[:session_id].nil?
      session[:session_key] = params[:session_id]
    end
    if session[:session_key].nil?
      return redirect_to "/app/home.cc"
    end
    key = UsersKey.where(:session_key => session[:session_key]).first
    if key.nil?
      return redirect_to "/app/home.cc"
    end
    @current_user = key.user 
  end

end

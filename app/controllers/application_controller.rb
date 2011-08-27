class ApplicationController < ActionController::Base
  protect_from_forgery

  def current_user
    @current_user
  end

  def authenticate_session!
		if Rails.env.development?
			return @current_user = User.find(8)
		end
    if !params[:session_id].nil?
      session[:session_key] = params[:session_id]
    end
    if session[:session_key].nil?
      return redirect_to "/app/home.cc"
    end
    logger.info(params[:session_id])
    logger.info(session[:session_key])
    key = UsersKey.where(:session_key => session[:session_key]).first
    logger.info(key)
    if key.nil?
      return redirect_to "/app/home.cc"
    end
    logger.info(key.user)
    @current_user = key.user 
    logger.info(@current_user)
  end

end

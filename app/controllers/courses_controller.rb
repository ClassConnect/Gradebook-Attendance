class CoursesController < ApplicationController
  def index
    @courses = Course.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml { render :xml => @users }
      format.json { render :json => @users }
    end
  end

end

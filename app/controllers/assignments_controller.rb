class AssignmentsController < ApplicationController
  def index
    @assignments = Assignment.all

    respond_to do |format|
      format.html
      format.xml { render :xmp => @assignments }
    end
  end

  def show
    @assignment = Assignment.find(params[:id])

    respond_to do |format|
      format.html
    end

  end

  def new
    @assignment = Assignment.new

    respond_to do |format|
      format.html
    end
  end


  def create
    @assignment = Assignment.new(params[:assignment])

    respond_to do |format|
      if @assignment.save
        @assignment.init_grades
        format.html { redirect_to(new_assignment_path, :notice => 'Assignment was created.')}
        format.js
      else
        format.html { render :action => "new"}
        format.js
      end
    end
  end

end

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

  #GET /gradebooks/:course_id/:assignment_id
  def edit
    @assignment = Assignment.find(params[:assignment_id])
    @types = AssignmentType.where(:course_id => params[:course_id])
  end

  #PUT /gradebooks/:course_id/:assignment_id
    def update
    @assignment = Assignment.find(params[:id])

    respond_to do |format|
      if @assignment.update_attributes(params[:assignment])
        format.html { redirect_to @assignment, notice: 'Grade was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @grade.errors, status: :unprocessable_entity }
      end
    end
  end

  def new
    @course = Course.find(params[:course_id])
    @assignment = Assignment.new
    @types = AssignmentType.where(:course_id => params[:course_id])
    respond_to do |format|
      format.html
    end
  end


  def create
    @assignment = Assignment.new(params[:assignment])

    respond_to do |format|
      if @assignment.save
        @assignment.init_grades
        format.html
        format.js
      else
        format.html
        format.js
      end
    end
  end

end

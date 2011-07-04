class AssignmentsController < ApplicationController
  #GET /gradebooks/:course_id/:assignment_id
  def edit
    @assignment = Assignment.find(params[:assignment_id])
    @types = AssignmentType.where(:course_id => params[:course_id])
  end

  def show
    @assignment = Assignment.find(params[:id])

    respond_to do |format|
      format.html {render text: @assignment}
      format.json {render json: @assignment}
    end
  end

  #PUT /gradebooks/:course_id/:assignment_id
    def update
    puts params
    @assignment = Assignment.find(params[:assignment][:id])
    respond_to do |format|
      if @assignment.update_attributes(params[:assignment])
        format.js
      else
        format.js
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

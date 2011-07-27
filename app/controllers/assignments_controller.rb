class AssignmentsController < ApplicationController
  #GET /gradebooks/:course_id/:assignment_id
  def edit
    @assignment = Assignment.find(params[:assignment_id])
    @types = AssignmentType.where(:course_id => params[:course_id])
    respond_to do |format|
      format.html {render :layout => false}
    end
  end

  def show
    @assignment = Assignment.find(params[:id])
    respond_to do |format|
      format.html {render :layout => false}
      format.json {render json: @assignment}
    end
  end

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
      format.html {render :layout => false}
    end
  end

  def create
    @assignment = Assignment.new(params[:assignment])
    @string = @assignment.course_id.to_s
    respond_to do |format|
      if @assignment.save
        format.html
        format.js
      else
        format.html
        format.js
      end
    end
  end

  def destroy
    @assignment = Assignment.find(params[:id])
    @grade_id = @assignment.assignment_grades[0].id;
    respond_to do |format|
      format.js
    end
    @assignment.destroy
  end

  #Method for updating individual grade
  def update_assignment_grade
    @assignment = Assignment.find(params[:id])
    puts params[:value]
    id = params[:student_id]
    if !@assignment.grades[id.to_s]
      @assignment.grades[id.to_s] = [:ungraded, :nocomment]
      @assignment.save
    end
    
    if params[:value] != ""
      @assignment.grades[id.to_s][0] = params[:value].to_i
    else
      @assignment.grades[id.to_s][0] = :ungraded
    end

    #This is unfortunately necessary due to a Mongoid bug
    array = @assignment.grades[id.to_s]
    @assignment.grades[id.to_s] = nil
    @assignment.save :validate => false
    @assignment.grades[id.to_s] = array
    @assignment.dirty_grade = true
    @assignment.save :validate => false

    @returned = params[:value]
    respond_to do |format|
      format.html {render :layout => false}
    end
  end

end

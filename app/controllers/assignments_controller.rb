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
    @assignment.calculate_average
    respond_to do |format|
      format.html {render :layout => false}
      format.json {render :json => @assignment}
    end
  end

    def update
    puts params
    @assignment = Assignment.find(params[:assignment][:id])
    @assignment.dirty_grade = true;
    respond_to do |format|
      if @assignment.update_attributes!(params[:assignment])
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
    @grade_id = @assignment.id
    respond_to do |format|
      format.js
    end
    @assignment.destroy
  end

  #Updating individual grade
  def update_assignment_grade
    @assignment = Assignment.find(params[:id])
    id = params[:student_id]
    if !@assignment.grades[id.to_s]
      @assignment.grades[id.to_s] = [:ungraded, :nocomment]
      @assignment.save
    end
    
    grade_value = params[:value]
    
    if grade_value != ""
      if grade_value == "EX" || grade_value == "IN" || grade_value == "DR"
        @assignment.grades[id.to_s][0] = grade_value
      else
        if (grade_value.to_f % 1 != 0.0)
          @assignment.grades[id.to_s][0] = params[:value].to_f
        else
          @assignment.grades[id.to_s][0] = params[:value].to_i
        end
      end
    else
      @assignment.grades[id.to_s][0] = :ungraded
    end

    #This is unfortunately necessary due to a Mongoid bug
    array = @assignment.grades[id.to_s]
    @assignment.grades[id.to_s] = nil
    @assignment.save :validate => false
    @assignment.grades[id.to_s] = array
    @assignment.update_attributes!(:dirty_grade => true)
    @assignment.save :validate => false
    puts @assignment.dirty_grade

    @returned = params[:value]
    respond_to do |format|
      format.html {render :layout => false}
    end
  end

  def grade_report
    @assignment = Assignment.find(params[:id])
    respond_to do |format|
      format.html {render :layout => false}
    end
  end

  def comment_submit
    @assignment = Assignment.find(params[:id])
    id = params[:student_id]
    if !@assignment.grades[id.to_s]
      @assignment.grades[id.to_s] = [:ungraded, :nocomment]
      @assignment.save
    end

    if params[:value] != ""
      @assignment.grades[id.to_s][1] = params[:value]
    else
      @assignment.grades[id.to_s][1] = :nocomment
    end

    #Unfortunately necessary due to a mongoid bug
    array = @assignment.grades[id.to_s]
    @assignment.grades[id.to_s] = nil
    @assignment.save :validate => false
    @assignment.grades[id.to_s] = array
    @assignment.save :validate => false

    respond_to do |format|
      format.html {render :text => ""}
    end
  end

end

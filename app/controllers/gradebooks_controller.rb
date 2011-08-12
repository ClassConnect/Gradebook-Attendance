class GradebooksController < ApplicationController

  before_filter :authenticate_session!
  before_filter :teaches_class?

  #Standard 10-point scale
  DEFAULT_SCALE = [{:from => 0,:to => 59, :name =>"F"}, {:from=>60,:to=>69,:name=>"D"}, {:from=>70,:to =>79,:name =>"C"}, {:from =>80,:to=>89,:name=>"B"},{:from=>90,:to=>100,:name=>"A"}]
  
  def show
    @course = Course.find(params[:course_id])
    @students = @course.students.order_names
    @assignments = @course.assignments.asc(:created_at).cache
    @settings = GradebookSettings.where(:course_id => params[:course_id])
    @settings &&= @settings.first
    if !@settings
      @settings = GradebookSettings.create!(:course_id => params[:course_id])
      for type in AssignmentType::DEFAULT_ASSIGNMENTS  
        AssignmentType.create!(:course_id => params[:course_id], :name => type)
      end
      @settings.create_grade_scale(:course_id => params[:course_id])
      @settings.save
    end
  end

  def table
    @course = Course.find(params[:course_id])
    @students = @course.students.order
    @assignments = @course.assignments
    render :layout => false
  end

  def report
    @course = Course.find(params[:course_id])
    @assignments = @course.assignments
  end

  def scale
    @scale = GradeScale.where(:course_id => params[:course_id]).first
  end

  private
  def teaches_class?()
    #selected_courses = @current_user.courses.select("id");
    logger.debug(@current_user.id)
  end
end

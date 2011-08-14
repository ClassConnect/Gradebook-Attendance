class GradebooksController < ApplicationController

  before_filter :authenticate_session!
  
  #Standard 10-point scale
  DEFAULT_SCALE = [{:from => 0,:to => 59, :name =>"F"}, {:from=>60,:to=>69,:name=>"D"}, {:from=>70,:to =>79,:name =>"C"}, {:from =>80,:to=>89,:name=>"B"},{:from=>90,:to=>100,:name=>"A"}]
  
  def show
    teaches_class?()
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
    logger.info(current_user)
    selected_courses = current_user.taught_courses;
    _selected_courses = current_user.taught_courses.select("id")
    logger.info(selected_courses)
    logger.info(_selected_courses)
  end
end

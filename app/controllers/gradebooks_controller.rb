class GradebooksController < ApplicationController
  #there's going to need to be lots of memcaching going on...

  before_filter :authenticate_session!, :except => [:weight]
  
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
        @settings.assignment_types.create!(:course_id => params[:course_id], :name => type)
      end
      @settings.create_grade_scale(:course_id => params[:course_id])
      @settings.save
    end
    unless Rails.env.development?
      if current_user.is_student?
        @student = current_user
        @types = @settings.assignment_types
      end
    end
    respond_to do |format|
      format.html {render :layout => false}
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

  def weight
    @settings = GradebookSettings.where(:course_id => params[:course_id]).first
    @types = AssignmentType.where(:course_id => params[:course_id]).cache
  end

  def student_view
    @course = Course.find(params[:course_id])
    @student = User.find(params[:student_id])
    #@assignments = @course.assignments.group
    @types = @course.assignment_types.cache
  end

  def update_course_grade
    #let's memcache @course. this shit is getting ridiculous.    
    @course = Course.find(params[:course_id])
    @settings = @course.gradebook_settings
    _grade = params[:value]
    @settings.course_grades[params[:student_id].to_s] = _grade
    @settings.save
    respond_to do |format|
      format.html {render :text => ""}
    end
  end

  private
  def teaches_class?(viewed_id)
    selected_course = current_user.taught_courses.find_by_id(viewed_id)
    if(selected_course == nil)
      return false
    end
  end

  def student_in_class?(viewed_id)

  end

end

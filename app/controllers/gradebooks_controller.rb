class GradebooksController < ApplicationController

  #Standard 10-point scale
  DEFAULT_SCALE = [{:from => 0,:to => 59, :name =>"F"}, {:from=>60,:to=>69,:name=>"D"}, {:from=>70,:to =>79,:name =>"C"}, {:from =>80,:to=>89,:name=>"B"},{:from=>90,:to=>100,:name=>"A"}]
  
  def show
    @course = Course.find(params[:course_id])
    @students = @course.students.order
    @assignments = @course.assignments
    @settings = GradebookSettings.where(course_id: params[:course_id]).first
    if !@settings
      @settings = GradebookSettings.create!(course_id: params[:course_id])
    end
    if @settings.first_load?
      for type in AssignmentType::DEFAULT_ASSIGNMENTS  
        AssignmentType.create!(course_id: params[:course_id], name: type)
      end
      @settings.write_attributes(first_load: false)
      @settings.save
    end
  end

  def table
    @course = Course.find(params[:course_id])
    @students = @course.students.order
    @assignments = @course.assignments
    render :layout => false
  end

end

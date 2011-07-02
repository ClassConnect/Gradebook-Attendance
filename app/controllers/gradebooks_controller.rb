class GradebooksController < ApplicationController

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

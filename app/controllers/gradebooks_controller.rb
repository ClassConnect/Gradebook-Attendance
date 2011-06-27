class GradebooksController < ApplicationController

  def show
    @course = Course.find(params[:course_id])
    @students = @course.students.order
    @assignments = @course.assignments
  end

  def table
    @course = Course.find(params[:course_id])
    @students = @course.students.order
    @assignments = @course.assignments
    render :layout => false
  end

end

class GradebooksController < ApplicationController
  include RailsDatatables
  include TestModule 


  def show
    @course = Course.find(params[:course_id])
    @students = @course.students.order
    @assignments = @course.assignments

  end

  
end

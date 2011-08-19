class ReportingController < ApplicationController
  def show
    @course = Course.find(params[:course_id])
  end
end

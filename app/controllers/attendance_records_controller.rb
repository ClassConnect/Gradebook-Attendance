class AttendanceRecordsController < ApplicationController
  # GET /attendance_records/1
  # GET /attendance_records/1.json
  def show
    @course = Course.find(params[:course_id])
    if params[:date].nil?
      @date = Date.today
    else
      @date = Date.strptime(params[:date],"%Y-%m-%d")
    end
    @students = @course.students
    @attendance_record = AttendanceRecord.find_or_create_by(:course_id => @course.id, :date => @date)
    @dtlength = @students.count
    respond_to do |format|
      format.html # show.html.erb
    end
  end
  
  def student_record
    @course = Course.find(params[:course_id])
    @student = User.find(params[:student_id])
    @records = AttendanceRecord.where(:course_id => params[:course_id]).any_in("cases."+@student.id_s => [:absent,:tardy]).order_by([:date,:desc])
    respond_to do |format|
      format.html { render :layout => false }
    end
  end
  
  def update_student
    @course = Course.find(params[:course_id])
    @date = Date.strptime(params[:date],"%Y-%m-%d")
    @attendance_record = AttendanceRecord.find_or_create_by(:course_id => @course.id, :date => @date)
    if params[:type] == "absent"
      if @attendance_record.cases[params[:student_id]] == :absent
        @attendance_record.cases.delete(params[:student_id])
      else
        @attendance_record.cases[params[:student_id]] = :absent
      end
    end
    if params[:type] == "tardy"
      if @attendance_record.cases[params[:student_id]] == :tardy
        @attendance_record.cases.delete(params[:student_id])
      else
        @attendance_record.cases[params[:student_id]] = :tardy
      end
    end
    @attendance_record.save
    render :text => "ok"
  end
end
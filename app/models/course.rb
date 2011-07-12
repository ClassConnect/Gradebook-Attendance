class Course < ActiveRecord::Base
#Class is a reserved word. Changed to Course.
#Too bad this isn't "CourseConnect"


#id
#name
#description
#classKey
#sid

  LEGACY_DATA = Date.new(2011, 06, 10)

  set_table_name "classes"
  belongs_to :school, :foreign_key => "sid"
  
  has_many :enrollments, :foreign_key => "cid"
  has_many :students, :class_name => "User", :through => :enrollments

  has_many :course_teachers, :foreign_key => "cid"
  has_many :teachers, :class_name => "User", :through => :course_teachers

  belongs_to :grading_period, :foreign_key => "sid"

  #has_many :assignments, :foreign_key => "cid"
  

#As of today's date, there is no support for referencing Mongoid from AR
#TODO: Fix this when that patch is released
  def assignments
    Assignment.where(course_id: id)
  end

  def get_assignment_by_type(type)
    Assignment.where(type: type)
  end

  def active_assignments
    Assignment.where(:date_due.gt => Time.now)
  end

  def ungraded_assignments
    Assignment.where(course_id: id, graded: false)
  end

  def legacy?
    @legacy ||= reg_date > LEGACY_DATA
  end

end

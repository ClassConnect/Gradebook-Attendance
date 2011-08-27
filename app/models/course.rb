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
    Assignment.where(:course_id => id)
  end

  def assignments_by_type(type)
    # AssignmentType.where(:name => type).assignments.where(:course_id => id)
    # Assignment.where(:course_id => id, :type => {:name => type})
    # atid = AssignmentType.where(:course_id => id, :name => type).first.id
    Assignment.where(:course_id => id, :assignment_type_id => AssignmentType.where(:course_id => id, :name => type).first.id)
  end
  
  def homework
    assignments_by_type("Homework")
  end
  
  def quizzes
    assignments_by_type("Quiz")
  end
  
  def tests
    assignments_by_type("Test")
  end
  
  def projects
    assignments_by_type("Project")
  end

  def active_assignments
    Assignment.where(:date_due.gt => Time.now)
  end

  def legacy?
    @legacy ||= reg_date > LEGACY_DATA
  end

  def assignment_types
    AssignmentType.where(:course_id => id)
  end

  def gradebook_settings
    GradebookSettings.where(:course_id => id).first
  end

  def attendance_records
    AttendanceRecord.where(:course_id => id).first
  end

  def attendance_records_with_case
    AttendanceRecord.where(:course_id => id, :cases.ne => {})
  end

end

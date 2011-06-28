class User < ActiveRecord::Base
  STUDENT = 1
  TEACHER = 3
  ADMIN = 4
  
  default_scope order('last_name, first_name')
  #Authentication
  #It's a many-to-one relationship because we're allowing logins on multiple IPs
  has_many :users_keys, :foreign_key => "uid"

  has_many :school_relationship, :foreign_key => "uid"
  has_many :schools, :through => :school_relationship, :source => :school

  #Student stuff
  has_many :enrollments, :foreign_key => "uid"
  has_many :courses, :through => :enrollments

  #Teacher stuff
  has_many :course_teachers, :foreign_key => "uid"
  has_many :taught_courses, :through => :course_teachers, :source => :course

  #In some legacy entries, there are users who are both teachers and students
  #As of ClassConnect 4, this should not happen



  
  def is_teacher?
    get_role == TEACHER
  end

  def is_student?
    get_role == STUDENT
  end

  def is_admin?
    get_role == ADMIN
  end

  def get_role
    @role ||= SchoolRelationship.find_by_uid(id).relationship_type
  end

#Teacher functionality


#Student functionality
#Near the end, we should see if there's an easy way to just have a 
#student and user model
  def active_assignments     
    courses.each do |course|
      course.active_assignments
    end
  end

  def get_grades
    AssignmentGrade.where(student_id: id, graded: false).ascending(:updated_at)
  end

  def get_grades_for_course(course_id)
    AssignmentGrade.where(student_id: id, course_id: course_id).ascending(:id)
  end

  def get_grades_for_gradebook
    AssignmentGrade.where(student_id: id)
  end

  #Custom serializer for students, needs to be this format for datatables
  def prepare_ajax
    assignment_grades = get_grades_for_gradebook
    #name = "[1"
    name = "[\"#{last_name.capitalize}, #{first_name.capitalize}\""
    grade_json = String.new 

    unless assignment_grades.count == 0
      assignment_grades.each do |grade|
        grade_json << ", #{grade.value}"
      end
    end

    name << (assignment_grades.count != 0 ? (grade_json << "]") : "]")
  end


end

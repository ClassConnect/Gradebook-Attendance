class AttendanceRecord
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :course_id, :type => Integer
  field :date, :type => Date
  
  # The cases hash is a list of all students that ARE either abset or tardy for
  # The given date. The key for the hash is the student's id, the value is
  # either :absent or :tardy 
  field :cases, :type => Hash, :default => {}
  
  cache
  
  def course
    Course.find(course_id)
  end
  
  def student_absent?(student)
    return cases[student.id.to_s] == :absent
  end
  
  def student_tardy?(student)
    return cases[student.id.to_s] == :tardy
  end
end

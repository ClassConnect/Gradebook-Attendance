class Assignment
  include Mongoid::Document
  include Mongoid::Timestamps

  
  has_many :assignment_grades
  belongs_to :assignment_type

  field :course_id, :type => Integer
  index :course_id

  field :teacher_id, :type => Integer
  field :created_by, :type => Integer

  field :name, :type => String
  field :description, :type => String
  field :point_value, :type => Integer
  field :date_due, :type => Date

  field :average, :type => Float
  field :dirty_grade, :type => Boolean, :default => false

  before_destroy :destroy_grades

  def init_grades
    course = Course.find(course_id)
    course.students.each do |student|
      unless student.is_teacher?
        assignment_grades.create(:student_id => student.id, :course_id => course.id, :value => 0, :graded => false)
      end
    end
  end

  def destroy_grades
    assignment_grades.destroy_all
  end

  def calculate_average
    num_students = assignment_grades.count
    return num_students
  end

end

class Assignment
  include Mongoid::Document
  include Mongoid::Timestamps

  has_many :assignment_grades
  has_one :assignment_type

  field :course_id, :type => Integer
  index :course_id

  field :teacher_id, :type => Integer
  field :created_by, :type => Integer

  field :name, :type => String
  field :description, :type => String
  field :date_due, :type => Date

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



end

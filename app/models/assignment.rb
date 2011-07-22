class Assignment
  include Mongoid::Document
  include Mongoid::Timestamps

  cache
  
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
  #All grades accessible from here
  field :grades, :type => Hash, :default => {}

  after_create :init_grades

  def init_grades
    students = Course.find(course_id).students
    students.each do |student|
      grades[student.id.to_s] = [:ungraded, :nocomment]
    end
    save
  end

  def calculate_average
    if(dirty_grade)
      total_grade=0.0
      to_grade = assignment_grades.where(:graded => true)
      to_grade.each do |grade|
        total_grade += grade.value
      end
      self.average = ((total_grade / point_value) / to_grade.count) * 100
      self.dirty_grade = false
      self.save
    end
  end

end

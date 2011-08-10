class Assignment
  include Mongoid::Document
  include Mongoid::Timestamps
  include ActionView::Helpers::NumberHelper

  cache
  
  belongs_to :assignment_type

  field :course_id, :type => Integer
  index :course_id

  field :name, :type => String
  field :point_value, :type => Integer
  field :date_due, :type => Date

  field :average, :type => Float
  #All grades accessible from here
  field :grades, :type => Hash, :default => {}
  field :dirty_grade, :type => Boolean

  validates_presence_of :course_id, :name, :point_value

  default_scope asc(:created_at)

  #Mongoid won't give me changes to arrays?
  #It sucks because I'm going to have to store a bool
  
  def update_grade(student_id, grade)
    grades[student_id.to_s] = grade
    save
  end

  def calculate_average
    if(dirty_grade)
      total_grade=0.0
      valid_grades=0
      puts self.grades.keys.any?
      puts self.grades.keys
      self.grades.each_key do |student_id|
        if(grades[student_id][0] != :ungraded)
          total_grade += grades[student_id][0]
          valid_grades += 1
        end
      end
      if valid_grades != 0
        self.average = percentage(((total_grade / point_value) / valid_grades) * 100)
      else
        self.average = "no_grades"
      end
      self.dirty_grade = false
      self.save
    end
  end

  private
  def percentage(number)
    return number_to_percentage(number, :precision => 2, :strip_insignificant_zeros => true)
  end

end

class AssignmentType
  include Mongoid::Document
  DEFAULT_ASSIGNMENTS = ["Homework", "Quiz", "Test", "Project"]

  has_many :assignments

  field :course_id, :type => Integer
  field :name, :type => String
  #perhaps future functionality?
  #field :weight, :type => Float
end

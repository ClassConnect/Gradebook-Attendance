class AssignmentType
  include Mongoid::Document
  DEFAULT_ASSIGNMENTS = ["Homework", "Quiz", "Test", "Project"]

  field :course_id, :type => Integer
  field :name, :type => String
  #perhaps future functionality?
  #field :weight, :type => Float
end

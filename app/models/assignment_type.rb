class AssignmentType
  include Mongoid::Document
  DEFAULT_ASSIGNMENTS = ["Homework", "Quiz", "Test", "Project"]

  cache

  has_many :assignments
  belongs_to :gradebook_settings, :class_name => "GradebookSettings"

  validates_presence_of :course_id

  field :course_id, :type => Integer
  field :name, :type => String
  field :weight, :type => Integer
end

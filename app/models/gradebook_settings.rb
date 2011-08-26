#This is a poorly named class - this is where all the gradebook logic is stored
class GradebookSettings
  include Mongoid::Document
  field :course_id, :type => Integer
  has_one :grade_scale
  has_many :assignment_types

  validates_presence_of :course_id

  #Store total course grades
  field :course_grades, :type => Hash, :default => {}

  accepts_nested_attributes_for :assignment_types, :allow_destroy => true
  #Possible values: "equal_weight", "no_weight", "manual_weight"
  field :weight_type, :type => String, :default => "equal_weight"

end

class GradebookSettings
  include Mongoid::Document

  field :course_id, :type => Integer
  has_one :grade_scale

  validates_presence_of :course_id

end

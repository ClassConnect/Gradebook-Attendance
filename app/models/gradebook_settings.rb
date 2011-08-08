class GradebookSettings
  include Mongoid::Document

  
  field :course_id, :type => Integer
  has_one :grade_scale

end

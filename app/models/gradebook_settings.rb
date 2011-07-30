class GradebookSettings
  include Mongoid::Document

  
  field :course_id, :type => Integer
  has_one :grade_scale
  field :percent_display, :type => Boolean, :default => true

end

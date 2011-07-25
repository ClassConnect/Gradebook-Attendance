class GradebookSettings
  include Mongoid::Document

  
  field :course_id, :type => Integer
  #Change away from integer? It'll be smaller...maybe symbols?
  field :grading_method, :type => Integer
  has_one :grade_scale

end

class GradebookSettings
  include Mongoid::Document

  field :course_id, :type => Integer
  field :first_load, :type => Boolean, default: true
  field :grading_scale, :type => Array
  
end

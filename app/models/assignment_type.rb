class AssignmentType
  include Mongoid::Document
  belongs_to :assignment
  field :course_id, :type => Integer
  field :name, :type => String
  #field :weight, :type => Float
end

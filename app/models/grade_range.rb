class GradeRange
  include Mongoid::Document
  embedded_in :grade_scale

  field :from, :type => Integer
  field :to, :type => Integer
  field :name, :type => String

  validates_presence_of :from, :to, :name

end

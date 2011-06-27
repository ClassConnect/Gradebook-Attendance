class AssignmentGrade
  include Mongoid::Document
  include Mongoid::Timestamps
#belongs_to :student, :class_name => :User, :foreign_key => "uid"
#TODO: Fix relations when Mongoid team adds support for relations with AR objects

  default_scope ascending(:id)

  belongs_to :assignment
  field :student_id, :type => Integer
  field :course_id, :type => Integer

#TODO: Support for "letter grades"
  field :value, :type => Integer, :default => 0
  field :graded, :type => Boolean, :default => false



end

class Enrollment < ActiveRecord::Base
  set_table_name "class_students"
  belongs_to :course, :foreign_key => "cid"
  belongs_to :students, :foreign_key => "uid"
end

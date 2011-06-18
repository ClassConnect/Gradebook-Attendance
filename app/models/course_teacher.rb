class CourseTeacher < ActiveRecord::Base
#It sucks, but "class" is a reserved word.
#Renamed this for consistency.

  set_table_name "class_teachers"
  belongs_to :course, :foreign_key => "cid"
  belongs_to :teacher, :foreign_key => "uid"
end

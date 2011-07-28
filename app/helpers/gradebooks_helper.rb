module GradebooksHelper
  include RailsDatatables

  def students_to_attr(student_array)
    returned_hash = "{"
    student_array.each do |student|
      returned_hash += "\"" + student.id.to_s + "\"" + ":" + "\"" +
      student.first_name.capitalize + " " + student.last_name.capitalize +
      "\""
      unless student == student_array.last
        returned_hash += ","
      end
    end
    returned_hash += "}"
    puts returned_hash
    return returned_hash
  end


end

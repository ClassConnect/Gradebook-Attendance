module AssignmentsHelper
  def id_to_link
    return @assignment.course_id.to_s + '/' + @assignment.id.to_s + '/edit'
  end
end

module AssignmentsHelper
  def id_to_link
    return @assignment.course_id.to_s + '/' + @assignment.id.to_s + '/edit'
  end

  def test_helper(test_var)
    return number_to_percentage(test_var)
  end

end

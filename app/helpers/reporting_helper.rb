module ReportingHelper
  
  def assignment_chart_series(assignments)
    str = "["
    assignments.each do |assignment|
      assignment.calculate_average
      # Make sure there is an average to display...
      if assignment.average != nil && assignment.average != "no_grades"
        str += '{'
        str += 'name:"'+assignment.name+'",'
        str += 'x:'+assignment.date_due.to_time.to_i.to_s+','
        str += 'y:'+assignment.average.to_f.to_s
        str += '},'
      end
      logger.debug str
    end
    str += "]"
    str.html_safe
  end

end

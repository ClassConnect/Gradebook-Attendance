module GradebooksHelper
  include RailsDatatables

#I made this shit for ajax'd datatables
#Don't have the heart to delete it now
  def prepare_for_datatables
    prepared_students = "["
    @students.each do |student|
      prepared_students << student.prepare_ajax
      unless student == @students.last
        prepared_students << ","
      end
    end
    prepared_students << "]"
  end

  def generate_columns
    columns = "[\"Name\""
    if @assignments.count > 0
      columns << ", "
      @assignments.each do |assignment|
        columns << "\"" << assignment.name << "\""
        unless assignment == @assignments.last
          columns << ", "
        end
      end
    end
    columns << "]"
  end


end

class SchoolRelationship < ActiveRecord::Base
  set_table_name "school_users"
  set_inheritance_column :ruby_type

  belongs_to :user, :foreign_key => "uid"
  belongs_to :school, :foreign_key => "sid"

  #This is necessary because the database has a "type column"
  def relationship_type
    self[:type]
  end
end

class CreateClassStudents < ActiveRecord::Migration
  def change
    create_table :class_students do |t|

      t.timestamps
    end
  end
end

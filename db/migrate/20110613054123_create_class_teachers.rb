class CreateClassTeachers < ActiveRecord::Migration
  def change
    create_table :class_teachers do |t|

      t.timestamps
    end
  end
end

class CreateSchoolUsers < ActiveRecord::Migration
  def change
    create_table :school_users do |t|

      t.timestamps
    end
  end
end

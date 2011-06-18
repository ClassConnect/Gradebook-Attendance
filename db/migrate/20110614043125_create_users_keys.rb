class CreateUsersKeys < ActiveRecord::Migration
  def change
    create_table :users_keys do |t|

      t.timestamps
    end
  end
end

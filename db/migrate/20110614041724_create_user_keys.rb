class CreateUserKeys < ActiveRecord::Migration
  def change
    create_table :user_keys do |t|

      t.timestamps
    end
  end
end

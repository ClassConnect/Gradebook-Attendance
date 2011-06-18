class CreateGradingPeriods < ActiveRecord::Migration
  def change
    create_table :grading_periods do |t|

      t.timestamps
    end
  end
end

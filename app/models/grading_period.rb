class GradingPeriod < ActiveRecord::Base
  belongs_to :school, :foreign_key => "sid"
  has_many :courses, :foreign_key => "sid"

end

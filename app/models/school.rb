class School < ActiveRecord::Base
  has_many :grading_periods, :foreign_key => "sid"

  has_many :courses, :foreign_key => "sid"

  has_many :school_relationships, :foreign_key => "sid"
  has_many :users, :through => :school_relationships

  has_many :teachers, :through => :school_relationships,
            :source => :user,
            #school_users.type due to type being reserved word for column
            :conditions => ("school_users.type = 3")
  
  has_many :students, :through => :school_relationships,
            :source => :user,
            :conditions => ("school_users.type = 1")


end

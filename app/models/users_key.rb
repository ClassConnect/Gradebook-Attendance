class UsersKey < ActiveRecord::Base
  belongs_to :user, :foreign_key => "uid"

  attr_accessor :session_key
end

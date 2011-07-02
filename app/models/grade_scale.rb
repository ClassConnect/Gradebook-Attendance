class GradeScale
  include Mongoid::Document

  embedded_in :gradebook_settings
end

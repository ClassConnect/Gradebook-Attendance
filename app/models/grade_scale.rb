class GradeScale
  include Mongoid::Document
  
  MODE_SCALE = "scale"
  
  DEFAULT_SCALE = [{:from => 0,:to => 59, :name =>"F"}, {:from=>60,:to=>69,:name=>"D"}, {:from=>70,:to =>79,:name =>"C"}, {:from =>80,:to=>89,:name=>"B"},{:from=>90,:to=>100,:name=>"A"}]

  field :course_id, :type => Integer
  field :scale_type, :type => String, :default => "scale"

  belongs_to :gradebook_settings, :class_name => "GradebookSettings"
  embeds_many :grade_ranges
  after_create :init_default_scale
  accepts_nested_attributes_for :grade_ranges, :allow_destroy => true

  def init_default_scale
    DEFAULT_SCALE.each do |range|
      grade_ranges.create!(:from => range[:from], :to => range[:to], :name => range[:name])
    end
  end

end

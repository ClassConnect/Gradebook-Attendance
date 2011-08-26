class GradebookSettingsController < ApplicationController

  def update_weight
    #cache this
    @settings = GradebookSettings.find(params[:settings_id])
    @settings.update_attributes!(params[:gradebook_settings])
    AssignmentType.where(:gradebook_settings_id => nil).destroy_all
    @settings.save
    respond_to do |format|
      format.js {render :layout => false}
    end
  end


end
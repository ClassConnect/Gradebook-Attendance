# Load the rails application
require File.expand_path('../application', __FILE__)

# Initialize the rails application
Gradebook::Application.initialize!

ActiveSupport::Inflector.inflections do |inflect|
  inflect.singular("gradebooksettings", "gradebooksettings")
end

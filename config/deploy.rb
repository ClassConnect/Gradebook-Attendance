default_run_options[:pty] = true

set :application, "gradebook-attendance"
set :user, "deploy"

set :repository, "git@github.com:ClassConnect/Gradebook-Attendance.git" 
set :branch, "master"
set :scm, :git

set :deploy_to, "/cap/staging"

role :web, "50.57.126.198"
role :app, "50.57.126.198"                          
role :db,  "50.57.126.198", :primary => true  # This is where Rails migrations will run

set :rails_env, 'production'
$:.unshift(File.expand_path('./lib', ENV['rvm_path']))
require "rvm/capistrano"

set :rvm_type, :system
set :rvm_ruby_string, '1.9.2'

after "deploy:update_code" do
  deploy.bundle
end

# If you are using Passenger mod_rails uncomment this:
 namespace :deploy do
   task :start do ; end
   task :stop do ; end
   task :bundle do
	run "cd #{release_path} && bundle install #{shared_path}/gems/cache"
   end
   task :restart, :roles => :app, :except => { :no_release => true } do
     run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
   end
 end

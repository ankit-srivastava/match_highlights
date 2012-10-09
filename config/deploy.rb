require 'capistrano/ext/multistage'
require 'capistrano/gitflow'

set :application,   "commentary"
set :repository,    "git@github.com:RevoContent/cricket_tiles.git"
set :stages, 	    %w(development staging production)
set :default_stage, "staging"

#-Start----------------Deploy server configuration----------------------------------------------------------------------
set :deploy_to, "/home/playup/#{application}"
set :user, "playup"
set :use_sudo, false
#-End----------------Deploy server configuration----------------------------------------------------------------------


#-Start----------------git configuration----------------------------------------------------------------------
#set :scm, :subversion
# Or: `accurev`, `bzr`, `cvs`, `darcs`, `git`, `mercurial`, `perforce`, `subversion` or `none`
set :scm, :git
set :scm_user, 'ankit-playup'#github user name
set :deploy_via, :remote_cache
set :repository_cache, "cached_copy"
#-End----------------git configuration----------------------------------------------------------------------

# if you want to clean up old releases on each deploy uncomment this:
# after "deploy:restart", "deploy:cleanup"

# if you're still using the script/reaper helper you will need
# these http://github.com/rails/irs_process_scripts

# If you are using Passenger mod_rails uncomment this:
 namespace :deploy do
   task :start do ; end
   task :stop do ; end
   task :restart, :roles => :app, :except => { :no_release => true } do
     run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
   end
 end

 task :copy_assets, :roles => :web do
  #run "ln -s #{current_release}/mobile/build/javascripts/#{application_env}/custom.js #{current_release}/mobile/build/javascripts/custom.js"
  run "cp #{latest_release}/public/build/javascripts/#{application_env}/custom.js #{latest_release}/public/build/javascripts/custom.js"
  run "cp #{latest_release}/public/build/css/#{application_env}/custom.css #{latest_release}/public/build/css/custom.css"
end

after "deploy:finalize_update", :copy_assets

# Let's clean up all except for last five releases
set :keep_releases, 5
after "deploy:update", "deploy:cleanup"

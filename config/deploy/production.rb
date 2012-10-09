=begin
role :web, "your web-server here"                          # Your HTTP server, Apache/etc
role :app, "your app-server here"                          # This may be the same as your `Web` server
role :db,  "your primary db-server here", :primary => true # This is where Rails migrations will run
role :db,  "your slave db-server here"
=end

set  :branch, 'deploy_v_1'
set  :application_env, "production"
role :app, "scorecard.playupcrickettiles.com"
role :web, "scorecard.playupcrickettiles.com"

require 'bundler/setup'

require 'boiler'
require './config'

require 'boiler/tasks/assets'
require 'boiler/tasks/layout'

task :configure do
  Boiler.configure(Messenger.boiler_config)
end

task :compile => ['configure', 'assets:precompile', 'layout:compile'] do
end

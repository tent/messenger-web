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

precompile_task = Rake::Task['assets:precompile']
prerequisites = precompile_task.prerequisites.dup
precompile_task.clear_prerequisites
precompile_task.enhance([:configure] + prerequisites)

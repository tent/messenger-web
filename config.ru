require 'bundler'
Bundler.require

$stdout.sync = true

require 'boiler'
require './config'

map '/' do
  use Rack::Session::Cookie,  :key => 'messenger.session',
                              :expire_after => 2592000, # 1 month
                              :secret => ENV['SESSION_SECRET'] || SecureRandom.hex
  run Boiler.new(Messenger.boiler_config)
end

require 'bundler'
Bundler.require

$stdout.sync = true

require 'boiler'
require './config'
require 'uri'

$app = Boiler.new(Messenger.boiler_config)

class Boiler::App::ContentSecurityPolicy
  alias _content_security_policy_rules content_security_policy_rules
  def content_security_policy_rules
    rules = _content_security_policy_rules

    contacts_service_uri = URI(Messenger.boiler_config[:js_config][:CONTACTS_URL])
    contacts_service_src = "#{contacts_service_uri.scheme}://#{contacts_service_uri.host}:*"

    src = "'self' #{contacts_service_src}"

    rules['frame-src'] = src
    rules['frame-ancestors'] = src

    rules
  end
end

map '/' do
  use Rack::Session::Cookie,  :key => 'messenger.session',
                              :expire_after => 2592000, # 1 month
                              :secret => ENV['SESSION_SECRET'] || SecureRandom.hex
  run $app
end

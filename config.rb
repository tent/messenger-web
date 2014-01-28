require 'contacts-service'

module Messenger
  def self.project_root
    @project_root ||= File.expand_path(File.dirname(__FILE__))
  end

  def self.boiler_config
    ContactsService.configure
    contacts_service_api_roots = ContactsService.settings[:asset_paths]
    {
      :tent_app => {
        :name => 'Messenger-Web',
        :description => 'Simple private messaging app',
        :display_url => 'https://github.com/cupcake/messenger-web',
        :read_types => %w(
          https://tent.io/types/relationship/v0
        ),
        :write_types => %w(
          https://tent.io/types/conversation/v0
          https://tent.io/types/message/v0
        )
      },
      :assets_dir => ENV['ASSETS_DIR'] || File.join(project_root, 'public'),
      :asset_roots => [
        File.join(project_root, 'src')
      ].concat(contacts_service_api_roots),
      :asset_names => %w(
        application.css
        application.js
        tent-client.js
        contacts_api.js
      ),
      :layout_roots => [
        File.join(project_root, 'layout')
      ],
      :layouts => [{
        :name => :messenger,
        :route => '/*'
      }],
      :global_nav_config_path => File.join(project_root, 'global_nav.json.erb'),
      :nav_config_path => File.join(project_root, 'nav.json'),
      :db_path => File.join(project_root, 'db'),

      :js_config => {
        :CONTACTS_URL => ENV['CONTACTS_URL'],
        :SIGIL_API_ROOT => ENV['SIGIL_API_ROOT']
      }
    }
  end
end

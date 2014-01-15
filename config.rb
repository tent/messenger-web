module Messenger
  def self.project_root
    @project_root ||= File.expand_path(File.dirname(__FILE__))
  end

  def self.boiler_config
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
        ),
        :scopes => %w( permissions )
      },
      :assets_dir => File.join(project_root, 'public'),
      :asset_roots => [
        File.join(project_root, 'src')
      ],
      :asset_names => %w(
        application.css
        application.js
      ),
      :layout_roots => [
        File.join(project_root, 'layout')
      ],
      :layouts => {
        :messenger => '/'
      },
      :global_nav_config_path => File.join(project_root, 'global_nav.json'),
      :nav_config_path => File.join(project_root, 'nav.json'),
      :db_path => File.join(project_root, 'db')
    }
  end
end

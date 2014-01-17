//= require_self
//= require ./config
//= require_tree ./routers
//= require_tree ./views
//= require_tree ./models
//= require_tree ./collections

(function () {

	if (typeof Messenger === 'undefined') {
		this.Messenger = {};
	}

	Marbles.Utils.extend(Messenger, Marbles.Events, {
		Routers: {},
		Views: {},
		Models: {},
		Collections: {},

		run: function () {
			if (!Marbles.history || Marbles.history.started) {
				return;
			}

			this.config.container_el = document.getElementById('main');

			// cleanup unwanted views before each route's handler is called
			Marbles.history.on('handler:before', function (handler, path, params) {
				React.unmountComponentAtNode(Messenger.config.container_el);
			});

			Boiler.run({
				container_el: this.config.container_el
			});

			this.ready = true;
			this.trigger('ready');
		},

		handleBoilerConfigChange: function () {
			Marbles.Utils.extend(Messenger.config, Boiler.config);
		}
	});

	// Keep Messenger.config updated with the contents of Boiler.config
	if (Boiler.config_ready) {
		Messenger.handleBoilerConfigChange();
	}
	Boiler.on('config:ready', Messenger.handleBoilerConfigChange);

	Boiler.on('change:current_entity', function () {
		Messenger.current_entity = Boiler.current_entity;
	});

	Boiler.on('change:client', function () {
		Messenger.client = Boiler.client;
	});

})();

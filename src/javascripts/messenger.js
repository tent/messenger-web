//= require_self
//= require_tree ./routers
//= require_tree ./views

(function () {

	if (typeof Messenger === 'undefined') {
		this.Messenger = {};
	}

	Marbles.Utils.extend(Messenger, {
		Routers: {},
		Views: {}
	});

})();

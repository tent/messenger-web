//= require boiler/routers/mixins

(function () {

	var MainRouter = Marbles.Router.createClass({
		displayName: 'Drop.Routers.main',

		mixins: [Boiler.Routers.Mixins],

		routes: [
			{ path : "" , handler: "converse"  },
		],

		converse: function (params) {
			this.resetScrollPosition.call(this);

			var message;
			function setMessage() {
				message = Messenger.Models.Message.findOrInit({
					id: 'new',
					entity: Messenger.current_entity
				});
			}
			setMessage();

			React.renderComponent(
				Messenger.Views.Converse({
					message: message
				}),
				Messenger.config.container_el
			);
		}
	});

	Messenger.Routers.main = new MainRouter();

})();

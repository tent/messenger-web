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
		}
	});

	Messenger.Routers.main = new MainRouter();

})();

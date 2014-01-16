//= require boiler/routers/mixins

(function () {

	var MainRouter = Marbles.Router.createClass({
		displayName: 'Drop.Routers.main',

		mixins: [Boiler.Routers.Mixins],

		routes: [
			{ path : ""                  , handler: "root"             } ,
			{ path : "conversations/new" , handler: "newConversation"  } ,
			{ path : "conversations"     , handler: "conversations"    }
		],

		root: function () {
			this.navigate('conversations/new', { replace: true });
		},

		newConversation: function (params) {
			this.resetScrollPosition.call(this);


		},

		conversations: function (params) {
			this.resetScrollPosition.call(this);
		}
	});

	Messenger.Routers.main = new MainRouter();

})();

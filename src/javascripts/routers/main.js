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

			var conversation;
			function setConversation() {
				conversation = Messenger.Models.Conversation.findOrInit({
					id: 'new',
					entity: Messenger.current_entity
				});
			}
			setConversation();

			var handleSubmitSuccess = function (res, xhr) {
				this.navigate('conversations');
			}.bind(this);

			React.renderComponent(
				Messenger.Views.NewConversation({
					conversation: conversation,
					handleSubmitSuccess: handleSubmitSuccess
				}),
				Messenger.config.container_el
			);
		},

		conversations: function (params) {
			this.resetScrollPosition.call(this);
		}
	});

	Messenger.Routers.main = new MainRouter();

})();

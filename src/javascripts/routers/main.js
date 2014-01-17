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

			var conversations = Messenger.Collections.Conversations.findOrInit({
				params: {
					types: [Messenger.config.POST_TYPES.CONVERSATION]
				}
			});

			React.renderComponent(
				Messenger.Views.Conversations({
					conversations: conversations
				}),
				Messenger.config.container_el
			);

			conversations.on('append prepend reset', function (models) {
				var conversation;
				for (var i = 0, _len = models.length; i < _len; i++) {
					conversation = models[i];
					conversation.messages.once('change', function () {
						conversations.trigger('change');
					});
					conversation.messages.fetch({
						params: {
							limit: 1
						}
					});
				}
			}, this);

			conversations.fetch();

			Marbles.history.once('handler:before', function () {
				conversations.detach();
			}, this);
		}
	});

	Messenger.Routers.main = new MainRouter();

})();

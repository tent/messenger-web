//= require boiler/routers/mixins

(function () {

	var MainRouter = Marbles.Router.createClass({
		displayName: 'Drop.Routers.main',

		mixins: [Boiler.Routers.Mixins],

		routes: [
			{ path : ""                          , handler: "root"             } ,
			{ path : "conversations"             , handler: "conversations"    } ,
			{ path : "conversations/:entity/:id" , handler: "conversation"		}
		],

		root: function () {
			this.navigate('conversations', { replace: true });
		},

		conversation: function (params) {
			this.resetScrollPosition.call(this);

			var view;
			var conversation = Messenger.Models.Conversation.findOrFetch({
				entity: params[0].entity,
				id: params[0].id
			}, {
				callback: {
					success: function (res, xhr) {
						conversation.messages.fetch();
					},

					failure: function (res, xhr) {
						view.setState({ error: res.error || ('Something went wrong. Error code: '+ xhr.status) });
					}
				}
			});

			view = React.renderComponent(
				Messenger.Views.Conversation({
					conversation: conversation
				}),
				Messenger.config.container_el
			);

			Marbles.history.once('handler:before', function () {
				conversation.detach();
			}, this);
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
					conversations: conversations,
					openConversation: function (conversation) {
						Marbles.history.navigate('conversations/'+ encodeURIComponent(conversation.entity) +'/'+ encodeURIComponent(conversation.id));
					}
				}),
				Messenger.config.container_el
			);

			conversations.on('append prepend reset', function (models) {
				function handleConversationsMessagesChange () {
					conversations.trigger('change');
				}

				var conversation;
				for (var i = 0, _len = models.length; i < _len; i++) {
					conversation = models[i];
					conversation.messages.once('change', handleConversationsMessagesChange);
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

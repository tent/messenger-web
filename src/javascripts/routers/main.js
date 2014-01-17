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

			var messages = Messenger.Collections.Messages.findOrInit({
				params: {
					types: [Messenger.config.POST_TYPES.MESSAGE],
					max_refs: 1
				}
			});

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

			messages.fetch({
				callback: {
					success: function (models, res, xhr) {
						var message, conversation;
						for (var i = 0, _len = models.length; i < _len; i++) {
							message = models[i];
							conversation = Messenger.Models.Conversation.find({cid: message.conversationCID});
							if (!conversation) {
								continue;
							}
							conversations.appendModels([conversation]);
						}
					}
				}
			});
		}
	});

	Messenger.Routers.main = new MainRouter();

})();

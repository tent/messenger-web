(function () {

	var Message = Marbles.Model.createClass({
		displayName: 'Messenger.Models.Message',

		modelName: 'message',

		cidMappingScope: ['id', 'entity'],

		didInitialize: function () {
			this.set('type', this.type || Messenger.config.POST_TYPES.MESSAGE);

			this.findLoadedConversation();
		},

		findLoadedConversation: function () {
			var _conversationType = Messenger.config.POST_TYPES.CONVERSATION;
			for (var i = 0, _refs = this.refs || [], _len = _refs.length; i < _len; i++) {
				conversation = Messenger.Models.Conversation.find({
					id: _refs[i].post,
					entity: _refs[i].entity || this.entity
				}, {fetch:false});
				if (conversation && conversation.type === _conversationType) {
					this.initConversation(conversation);
				}
				break;
			}
		},

		initConversation: function (conversation) {
			this.conversationCID = conversation.cid;

			if (conversation.id === 'new') {
				conversation.once('change:id', this.handleChangeConversationID, this);
			}

			conversation.on('change:mentions', this.handleChangeConversationMentions, this);

			if (this.id !== 'new') {
				conversation.messages.appendModels([this]);
			}
		},

		handleChangeConversationID: function () {
			var conversation = Messenger.Models.Conversation.find({ cid: this.conversationCID });
			this.refs = [{ post: conversation.id }];
			this.mentions = [{ post: conversation.id }].concat(conversation.mentions);
		},

		handleChangeConversationMentions: function () {
			var conversation = Messenger.Models.Conversation.find({ cid: this.conversationCID });
			this.mentions = [{ post: conversation.id }].concat(conversation.mentions);
		},

		save: function (options) {
			var data = this.toJSON();
			var callback = {
				success: function (res, xhr) {
					this.parseAttributes(res.post);
					if (typeof options.success === 'function') {
						options.success.apply(null, arguments);
					}
				}.bind(this),
				failure: function (res, xhr) {
					if (typeof options.failure === 'function') {
						options.failure(res, xhr);
					}
				},
				complete: function (res, xhr) {
					if (typeof options.complete === 'function') {
						options.complete(res, xhr);
					}
				}
			};
			if (this.id === 'new') {
				delete data.id;
				Messenger.client.createPost(data, {
					callback: callback
				});
			} else {
				Messenger.client.updatePost(data, {
					callback: callback
				});
			}
		},

		toJSON: function () {
			var attrs = {},
					keys = [
						'id',
						'type',
						'entity',
						'version',
						'mentions',
						'refs',
						'content',
						'published_at'
					];
			for (var i = 0, _len = keys.length; i < _len; i++) {
				if (this.hasOwnProperty(keys[i])) {
					attrs[keys[i]] = this[keys[i]];
				}
			}
			return attrs;
		}
	});

	Message.findOrInit = function (attrs) {
		return Message.find(attrs, { fetch: false }) || new Message(attrs);
	};

	Messenger.Models.Message = Message;

})();

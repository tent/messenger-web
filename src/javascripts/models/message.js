Messenger.Models.Message = Marbles.Model.createClass({
	displayName: 'Messenger.Models.Message',

	mixins: [{
		ctor: {
			modelName: 'message',

			cidMappingScope: ['id', 'entity', 'conversation_id'],

			// toJSON() will only return these attrs
			JSONKeys: [
				'id',
				'type',
				'entity',
				'version',
				'mentions',
				'refs',
				'content',
				'published_at'
			],

			findOrInit: function (attrs) {
				return this.find(attrs, {fetch:false}) || new this(attrs);
			},

			// Prevent error from being thrown via find()
			fetch: function () {}
		}
	}],

	didInitialize: function () {
		this.set('type', this.type || Messenger.config.POST_TYPES.MESSAGE);

		this.findLoadedConversation();
	},

	parseAttributes: function (attrs) {
		if (attrs.id !== 'new' && attrs.refs && attrs.refs.length && attrs.refs[0].post) {
			this.set('conversation_id', attrs.refs[0].post);
		}

		this.constructor.__super__.parseAttributes.apply(this, arguments);
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

		this.set('conversation_id', conversation.id);

		conversation.on('change:mentions', this.handleChangeConversationMentions, this);

		if (this.id !== 'new') {
			var latest = conversation.messages.first();
			if (latest && latest.received_at < this.received_at) {
				conversation.messages.prependModels([this]);
			} else {
				conversation.messages.appendModels([this]);
			}
		}
	},

	handleChangeConversationID: function () {
		var conversation = Messenger.Models.Conversation.find({ cid: this.conversationCID });
		this.set('conversation_id', conversation.id);
		this.refs = [{ post: conversation.id, entity: conversation.entity }];
		this.mentions = [{ post: conversation.id, entity: conversation.entity }].concat(conversation.mentions);
	},

	handleChangeConversationMentions: function () {
		var conversation = Messenger.Models.Conversation.find({ cid: this.conversationCID });
		this.mentions = [{ post: conversation.id, entity: conversation.entity }].concat(conversation.mentions);
	},

	save: function (options) {
		var err = this.validate();
		if (err) {
			var res = { error: err };
			var xhr = { status: 400 };
			if (typeof options.failure === 'function') {
				options.failure(res, xhr);
			}
			if (typeof options.complete === 'function') {
				options.complete(res, xhr);
			}
			return;
		}

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

	validate: function () {
		if (!(this.get('content.text') || '').trim()) {
			return "Message has no content.";
		}
		return null;
	}
});

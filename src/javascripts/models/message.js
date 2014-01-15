(function () {

	var Message = Marbles.Model.createClass({
		displayName: 'Messenger.Models.Message',

		modelName: 'message',

		cidMappingScope: ['id', 'entity'],

		willInitialize: function () {
			this.type = Messenger.config.POST_TYPES.MESSAGE;
			this.on('change:mentions', this.handleChangeMentions);
			this.on('change:refs', this.handleChangeRefs);
			this.on('change:conversationRef', this.handleChangeConversationRef);
		},

		didInitialize: function () {
			if (!this.conversationRef && this.id === 'new') {
				var _conversation = Messenger.Models.Conversation.findOrInit({
					id: 'new',
					entity: this.entity
				});
				this.set('conversationRef', {
					type: Messenger.config.POST_TYPES.CONVERSATION,
					post: _conversation.id,
					entity: _conversation.entity
				});
				this.refs  = this.refs || [];
				this.refs.push(this.conversationRef);
				_conversation.once('change:id', function () {
					this.set('conversationRef.post', _conversation.id);
					this.handleChangeConversationRef();
				}, this);
				this.set('conversationCID', _conversation.cid);
			}
		},

		handleChangeMentions: function () {
			var _conversationType = Messenger.config.POST_TYPES.CONVERSATION;
			for (var i = 0, _mentions = this.mentions, _len = _mentions.length; i < _len; i++) {
				if (_mentions[i].type === _conversationType) {
					this.set('conversationMention', _mentions[i]);
					break;
				}
			}
		},

		handleChangeRefs: function () {
			var _conversationType = Messenger.config.POST_TYPES.CONVERSATION;
			for (var i = 0, _refs = this.refs, _len = _refs.length; i < _len; i++) {
				if (_refs[i].type === _conversationType) {
					this.set('conversationRef', _refs[i]);
					break;
				}
			}
		},

		handleChangeConversationRef: function () {
			if (!this.conversationMention) {
				var _mention = {};
				this.mentions = this.mentions || [];
				this.conversationMention = _mention;
				this.mentions.push(_mention);
			}

			this.set('conversationMention.type', this.conversationRef.type);
			this.set('conversationMention.post', this.conversationRef.post);
			this.set('conversationMention.entity', this.conversationRef.entity);

			if (this.conversationRef.post !== 'new' && !this.conversationCID) {
				this.fetchConversation({
					success: function (conversation) {
						this.set('conversationCID', conversation.cid);
					}.bind(this)
				});
			}
		},

		fetchConversation: function (options) {
			if (!options) {
				options = {};
			}

			return Messenger.Models.Conversation.find({
				id: this.conversationRef.post,
				entity: this.conversationRef.entity
			}, options);
		},

		save: function () {
			var fetchConversation = function () {
				this.fetchConversation({
					success: function (conversation) {
						this.set('conversationCID', conversation.cid);
						this.save();
					}.bind(this),

					failure: function (res, xhr) {
						// Something went wrong
						this.trigger('save:failure', res, xhr);
						this.trigger('save:complete', false, res, xhr);
					}.bind(this)
				});
			}.bind(this);

			if (this.conversationRef.post === 'new') {
				// Create the conversation before continuing
				// (it shouldn't be possible for find to return null here)
				var _conversation = Messenger.Models.Conversation.find({
					cid: this.conversationCID
				});
				_conversation.once('save:complete', function (isSuccess, res, xhr) {
					if (isSuccess) {
						// Conversation is saved and has a proper id
						this.save();
					} else {
						// Something went wrong
						this.trigger('save:failure', res, xhr);
						this.trigger('save:complete', isSuccess, res, xhr);
					}
				}, this);
				_conversation.save();
				return;
			}

			if (!this.conversationCID) {
				// We don't have the conversation loaded
				// and we need it to know who to mention
				fetchConversation();
				return;
			}

			var conversation = Messenger.Models.Conversation.find({
				cid: this.conversationCID
			});
			if (!conversation) {
				// Looks like it's no longer in memory,
				// load it again
				fetchConversation();
				return;
			}

			data = this.toJSON();

			// make sure it mentions everyone
			mentions = [this.conversationMention].concat(conversation.mentions);

			console.log('TODO: Save message', data);
			// TODO trigger save:success(res, xhr)
			// TODO trigger save:failure(res, xhr)
			// TODO trigger save:complete(success, res, xhr)
		},

		toJSON: function () {
			var attrs = {},
					keys = [
						'id',
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

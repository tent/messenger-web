(function () {

	var Conversation = Marbles.Model.createClass({
		displayName: 'Messenger.Models.Conversation',

		modelName: 'conversation',

		cidMappingScope: ['id', 'entity'],

		willInitialize: function () {
			this.newMessage = null;
		},

		didInitialize: function () {
			this.set('type', this.type || Messenger.config.POST_TYPES.CONVERSATION);
		},

		setRecipients: function (entities) {
			var mentions = [];
			for (var i = 0, _len = entities.length; i < _len; i++) {
				mentions.push({
					entity: entities[i]
				});
			}
			this.set('mentions', mentions);
		},

		setNewMessage: function (attrs) {
			attrs = Marbles.Utils.extend({
				id: 'new',
				entity: this.entity,
				mentions: [{
					post: this.id
				}].concat(this.mentions || []),
				refs: [{
					post: this.id
				}]
			}, attrs);
			var message = Messenger.Models.Message.findOrInit(attrs, {fetch: false});
			message.initConversation(this);
			this.newMessage = message;
			return message;
		},

		saveNewMessage: function (options) {
			if (this.newMessage) {
				this.newMessage.mentions = [{ post: this.id }].concat(this.mentions || []);
				this.newMessage.refs = [{ post: this.id }];

				this.newMessage.save({
					success: function (res, xhr) {
						this.newMessage = null;
						options.success(res, xhr);
					}.bind(this),

					failure: function (res, xhr) {
						options.failure(res, xhr);
					},

					complete: function (res, xhr) {
						options.complete(res, xhr);
					}
				});
				return;
			}
		},

		save: function (options) {
			var data = this.toJSON();
			var callback = {
				success: function (res, xhr) {
					this.parseAttributes(res.post);
					this.saveNewMessage({
						success: function () {
							if (typeof options.success === 'function') {
								options.success(res, xhr);
							}
						},

						failure: function (res, xhr) {
							if (typeof options.failure === 'function') {
								options.failure(res, xhr);
							}
						},

						complete: function () {
							if (typeof options.complete === 'function') {
								options.complete(res, xhr);
							}
						}
					});
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
				data.version = {
					parents: [{
						version: data.version.id
					}]
				};
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

	Conversation.findOrInit = function (attrs) {
		return Conversation.find(attrs, { fetch: false }) || new Conversation(attrs);
	};

	Conversation.fetch = function (params, options) {
		console.log("TODO: Fetch conversation", params, options);
	};

	Messenger.Models.Conversation = Conversation;

})();

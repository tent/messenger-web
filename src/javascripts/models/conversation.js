(function () {

	var Conversation = Marbles.Model.createClass({
		displayName: 'Messenger.Models.Conversation',

		modelName: 'conversation',

		cidMappingScope: ['id', 'entity'],

		didInitialize: function () {
			this.set('type', this.type || Messenger.config.POST_TYPES.CONVERSATION);
			this.initNewMessage();
			this.initMessages();

			if (this.id === 'new') {
				this.once('change:id', this.initMessages, this);
			}
		},

		detach: function () {
			this.messages.detach();
			this.newMessage.detach();
			this.constructor.__super__.detach.apply(this, arguments);
		},

		initNewMessage: function (entity) {
			this.newMessage = Messenger.Models.Message.findOrInit({
				id: 'new',
				entity: this.entity
			});
			this.newMessage.initConversation(this);

			this.shouldSaveNewMessage = false;
			this.newMessage.once('change:content.text', function () {
				this.shouldSaveNewMessage = true;
			}, this);
		},

		initMessages: function () {
			if (this.messages) {
				this.messages.detach();
			}

			this.messages = Messenger.Collections.Messages.findOrInit({
				params: {
					types: [Messenger.config.POST_TYPES.MESSAGE],
					mentions: this.entity +' '+ this.id
				}
			});
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

		saveNewMessage: function (options) {
			if (this.shouldSaveNewMessage) {
				this.newMessage.save({
					success: function (res, xhr) {
						this.initNewMessage();
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
			} else {
				options.success();
				options.complete();
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

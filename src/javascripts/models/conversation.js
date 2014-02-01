Messenger.Models.Conversation = Marbles.Model.createClass({
	displayName: 'Messenger.Models.Conversation',

	mixins: [{
		ctor: {
			modelName: 'conversation',

			cidMappingScope: ['id', 'entity'],

			// toJSON() will only return these attrs
			JSONKeys: [
				'id',
				'type',
				'entity',
				'version',
				'mentions',
				'published_at'
			],

			findOrInit: function (attrs) {
				return this.find(attrs, {fetch:false}) || new this(attrs);
			},

			findOrFetch: function (attrs, options) {
				var _instance, _res, _xhr;
				_instance = this.find(attrs, {fetch:false});
				if (_instance && options && options.callback) {
					// defer callback until after fn return
					setTimeout(function () {
						var res = {
							post: c.toJSON()
						};
						var xhr = {
							status: 304
						};
						if (typeof options.callback === 'function') {
							options.callback(res, xhr);
						} else {
							if (typeof options.callback.success === 'function') {
								options.callback.success(res, xhr);
							}
							if (typeof options.callback.complete === 'function') {
								options.callback.complete(res, xhr);
							}
						}
					}, 0);
				} else if (!_instance) {
					_instance = this.fetch(attrs, options);
				}
				return _instance;
			},

			fetch: function (attrs, options) {
				var _instance = new this(attrs);
				_instance.fetch(options);
				return _instance;
			}
		}
	}],

	didInitialize: function () {
		this.set('type', this.type || Messenger.config.POST_TYPES.CONVERSATION);
		this.initNewMessage();
		this.initMessages();

		if (this.id === 'new') {
			this.once('change:id', this.initMessages, this);
		}

		this.once('detach', this.handleDetach, this);
	},

	handleDetach: function () {
		this.messages.detach();
		this.newMessage.detach();
	},

	initNewMessage: function (entity) {
		this.newMessage = Messenger.Models.Message.findOrInit({
			id: 'new',
			entity: this.entity,
			conversation_id: this.id
		});
		this.newMessage.initConversation(this);
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

		this.messages.on('change', this.__cacheLatestMessage, this);
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

	validate: function () {
		if (!this.mentions || this.mentions.length === 0) {
			return "Conversation must have participants.";
		}

		if (this.shouldSaveNewMessage) {
			return this.newMessage.validate();
		}

		return null;
	},

	performDelete: function (callback) {
		var performDeleteConversation = function () {
			Messenger.client.deletePost({
				params: [{
					entity: this.entity,
					post: this.id
				}],

				callback: {
					success: function (res, xhr) {
						this.detach();
						if (typeof callback.success === 'function') {
							callback.success();
						}
					}.bind(this),

					failure: callback.failure
				}
			});
		}.bind(this);

		this.__deleteMessages({
			success: performDeleteConversation,
			failure: callback.failure
		});
	},

	__deleteMessages: function (callback) {
		var fetchComplete = false;
		var numRemaining = 0;
		var numFailed = 0;

		var handleComplete = function () {
			if (fetchComplete && numRemaining === 0 && numFailed === 0) {
				callback.success();
			}
		};

		var handleDeleteSuccess = function () {
			numRemaining--;

			handleComplete();
		}.bind(this);

		var handleDeleteFailure = function (res, xhr) {
			numRemaining--;
			numFailed++;

			callback.failure(res, xhr);
			handleComplete();
		}.bind(this);

		var deleteMessage = function (message) {
			message.performDelete({
				success: handleDeleteSuccess,
				failure: handleDeleteFailure
			});
		};

		var handleFetchSuccess = function () {
				var models = this.messages.models();
				if (models.length === 0) {
					return handleFetchComplete();
				}

				var len = models.length;

				numRemaining += len;

				for (var i = 0; i < len; i++) {
					deleteMessage(models[i]);
				}

				fetchNextPage();
		}.bind(this);

		var handleFetchComplete = function () {
			fetchComplete = true;
			handleComplete();
		}.bind(this);

		var fetchNextPage = function () {
			var lastPage = !this.messages.fetchNext({
				callback: {
					success: handleFetchSuccess,
					failure: callback.failure
				}
			});

			if (lastPage) {
				handleFetchComplete();
			}
		}.bind(this);

		this.__fetchMessages({
			success: handleFetchSuccess,
			failure: callback.failure
		});
	},

	__fetchMessages: function (callback) {
		this.messages.fetch({
			callback: callback
		});
	},

	fetch: function (options) {
		var conversation = this;
		var opts = Marbles.Utils.extend({}, options || {}, {
			params: [{
				entity: this.entity,
				post: this.id
			}],
			callback: {
				success: function (res, xhr) {
					conversation.parseAttributes(res.post);

					if (options.callback) {
						if (typeof options.callback === 'function') {
							options.callback(res, xhr);
						} else if (typeof options.callback.success === 'function') {
							options.callback.success(res, xhr);
						}
					}
				},

				failure: function (res, xhr) {
					if (options.callback) {
						if (typeof options.callback === 'function') {
							options.callback(res, xhr);
						} else if (typeof options.callback.failure === 'function') {
							options.callback.failure(res, xhr);
						}
					}
				}
			}
		});
		Messenger.client.getPost(opts);
	},

	fetchLatestMessage: function () {
		var latestMessage = this.__getLatestCachedMessage();

		if (latestMessage) {
			this.messages.resetModels([latestMessage]);
		} else {
			this.messages.fetch({
				params: {
					limit: 1
				}
			});
		}
	},

	__getLatestCachedMessage: function () {
		var manifest = Messenger.LocalCache.getItem('manifest');
		if (!manifest || !manifest.latestConversationMessage) {
			return null;
		}

		var latestMessageMeta = manifest.latestConversationMessage[this.entity +':'+ this.id];
		if (!latestMessageMeta) {
			return null;
		}

		var latestMessageJSON = Messenger.LocalCache.getItem(latestMessageMeta.entity +':'+ latestMessageMeta.id);
		if (!latestMessageJSON) {
			return null;
		}

		return Messenger.Models.Message.findOrInit(latestMessageJSON);
	},

	__cacheLatestMessage: function () {
		var latestMessage = this.messages.first();
		if (!latestMessage) {
			return;
		}

		var latestMessageJSON = latestMessage.toJSON();
		var latestMessageMeta = {
			entity: latestMessage.entity,
			id: latestMessage.id
		};

		Messenger.LocalCache.setItem(latestMessage.entity +':'+ latestMessage.id, latestMessageJSON);

		var manifest = Messenger.LocalCache.getItem('manifest') || {};
		if (!manifest.latestConversationMessage) {
			manifest.latestConversationMessage = {};
		}
		manifest.latestConversationMessage[this.entity +':'+ this.id] = latestMessageMeta;
		Messenger.LocalCache.setItem('manifest', manifest);
	}
});

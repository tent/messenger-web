(function () {

	var Message = Marbles.Model.createClass({
		displayName: 'Messenger.Models.Message',

		modelName: 'message',

		cidMappingScope: ['id', 'entity'],

		didInitialize: function () {
			this.set('type', this.type || Messenger.config.POST_TYPES.MESSAGE);
		},

		initConversation: function (conversation) {
			if (conversation.id === 'new') {
				conversation.once('change:id', function () {
					this.refs = [{ post: conversation.id }];
					this.mentions = [{ post: conversation.id }].concat(conversation.mentions);
				}, this);
			}
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

(function () {

	var Conversation = Marbles.Model.createClass({
		displayName: 'Messenger.Models.Conversation',

		modelName: 'conversation',

		cidMappingScope: ['id', 'entity'],

		willInitialize: function () {
			this.type = Messenger.config.POST_TYPES.CONVERSATION;
		},

		save: function () {
			data = this.toJSON();

			console.log('TODO: Save conversation', data);
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

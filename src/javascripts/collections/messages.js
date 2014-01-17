Messenger.Collections.Messages = Boiler.Collections.PostsFeed.createClass({
	displayName: 'Messenger.Collections.Messages',

	collectionName: 'messages',

	model: Messenger.Models.Message,

	handleFetchSuccess: function (res, xhr, options) {
		var refs = res.refs;
		var _conversationType = Messenger.config.POST_TYPES.CONVERSATION;
		for (var i = 0, _len = refs.length; i < _len; i++) {
			if (refs[i].type !== _conversationType) {
				continue;
			}
			new Messenger.Models.Conversation(refs[i]);
		}

		this.constructor.__super__.handleFetchSuccess.apply(this, arguments);
	}
});

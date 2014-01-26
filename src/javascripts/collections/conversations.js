Messenger.Collections.Conversations = Boiler.Collections.PostsFeed.createClass({
	displayName: 'Messenger.Collections.Conversations',

	mixins: [{
		ctor: {
			collectionName: 'conversations',
			model: Messenger.Models.Conversation,
		}
	}],

	detach: function () {
		if (this.modelCIDs) {
			this.modelCIDs.forEach(function (cid) {
				this.constructor.model.detach(cid);
			}.bind(this));
		}
		this.constructor.__super__.detach.apply(this, arguments);
	}
});

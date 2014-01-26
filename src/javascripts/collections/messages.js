Messenger.Collections.Messages = Boiler.Collections.PostsFeed.createClass({
	displayName: 'Messenger.Collections.Messages',

	collectionName: 'messages',

	model: Messenger.Models.Message,

	detach: function () {
		if (this.modelCIDs) {
			this.modelCIDs.forEach(function (cid) {
				this.constructor.model.detach(cid);
			}.bind(this));
		}
		this.constructor.__super__.detach.apply(this, arguments);
	}
});

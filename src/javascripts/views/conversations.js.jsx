/** @jsx React.DOM */

Messenger.Views.Conversations = React.createClass({
	displayName: 'Messenger.Views.Conversations',

	getInitialState: function () {
		return {
			models: [],
			lastPage: true
		};
	},

	componentDidMount: function () {
		this.bindConversations(this.props.conversations);
		this.setPullTimeout();
		this.setNewConversation();
	},

	componentWillReceiveProps: function (props) {
		if (this.props.conversations && props.conversations && this.props.conversations.cid !== props.conversations.cid) {
			this.unbindConversations(this.props.conversations);
		}
		this.bindConversations(props.conversations);
	},

	componentWillUnmount: function () {
		this.unbindConversations(this.props.conversations);
		clearTimeout(this.pullTimeout);
		this.state.newConversation.detach();
	},

	bindConversations: function (conversations) {
		if (!conversations) {
			return;
		}
		conversations.on('change', this.handleChangeConversations, this);
	},

	unbindConversations: function (conversations) {
		if (!conversations) {
			return;
		}
		conversations.off('change', this.handleChangeConversations, this);
	},

	handleChangeConversations: function () {
		this.setState({
			models: this.props.conversations.models(),
			lastPage: !this.props.conversations.pages.next
		});
	},

	setPullTimeout: function () {
		this.pullTimeout = setTimeout(this.loadPrevPage, 5000);
	},

	loadPrevPage: function () {
		this.props.conversations.fetchPrev({
			prepend: true,
			callback: function (res, xhr) {
				this.setPullTimeout();
			}.bind(this)
		});
	},

	loadNextPage: function () {
		var res = this.props.conversations.fetchNext({ append: true });
		if (res === false) {
			this.setState({ lastPage: true });
		}
	},

	handleNewConversationCreated: function () {
		this.setNewConversation();
	},

	setNewConversation: function () {
		this.setState({
			newConversation: Messenger.Models.Conversation.findOrInit({
				id: 'new',
				entity: Messenger.current_entity
			})
		});
	},

	render: function () {
		var TruncatedMessage = Messenger.Views.TruncatedMessage,
				RelativeTimestamp = Boiler.Views.RelativeTimestamp,
				ConversationListItem = Messenger.Views.ConversationListItem,
				InfiniteScroll = React.addons.InfiniteScroll
				NewConversation = Messenger.Views.NewConversation;
		var items = [];
		var models = this.state.models;
		var conversation, messageNode, latestMessage;
		for (var i = 0, _len = models.length; i < _len; i++) {
			conversation = models[i];
			latestMessage = conversation.messages.first();
			if (latestMessage) {
				messageNode = <TruncatedMessage message={latestMessage} />;
			} else {
				messageNode = '';
			}
			items.push(
				<ConversationListItem key={conversation.cid} conversation={conversation} openConversation={this.props.openConversation} />
			);
		}

		newConversation = '';
		if (this.state.newConversation) {
			newConversation = (
				<NewConversation
					key={this.state.newConversation.cid}
					conversation={this.state.newConversation}
					handleSubmitSuccess={this.handleNewConversationCreated} />
			);
		}

		return (
			<div>
				{newConversation}

				<ul className='unstyled conversations'>
					{items}
				</ul>

				<InfiniteScroll
					loadMore={this.loadNextPage}
					hasMore={!this.state.lastPage}
					loader={<div>Loading...</div>}
					threshold={250} />
			</div>
		);
	}
});

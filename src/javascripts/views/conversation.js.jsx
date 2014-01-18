/** @jsx React.DOM */

Messenger.Views.Conversation = React.createClass({
	displayName: 'Messenger.Views.Conversation',

	getInitialState: function () {
		return {
			messages: [],
			error: null,
			lastPage: true
		};
	},

	componentDidMount: function () {
		this.bindConversation(this.props.conversation);
		this.setPullTimeout();
	},

	componentWillReceiveProps: function (props) {
		if (this.props.conversation !== props.conversation) {
			this.unbindConversation(this.props.conversation);
			this.bindConversation(props.conversation);
		}
	},

	componentWillUnmount: function () {
		this.unbindConversation(this.props.conversation);
		clearTimeout(this.pullTimeout);
	},

	bindConversation: function (conversation) {
		if (!conversation) {
			return;
		}
		conversation.messages.on('change', this.handleChangeConversation);
	},

	unbindConversation: function (conversation) {
		if (!conversation) {
			return;
		}
		conversation.messages.off('change', this.handleChangeConversation);
	},

	handleChangeConversation: function () {
		this.setState({
			messages: this.props.conversation.messages.models(),
			lastPage: !this.props.conversation.messages.pages.next
		});
	},

	setPullTimeout: function () {
		this.pullTimeout = setTimeout(this.loadPrevPage, 5000);
	},

	loadPrevPage: function () {
		this.props.conversation.messages.fetchPrev({
			prepend: true,
			callback: function (res, xhr) {
				this.setPullTimeout();
			}.bind(this)
		});
	},

	loadNextPage: function () {
		var res = this.props.conversation.messages.fetchNext({ append: true });
		if (res === false) {
			this.setState({ lastPage: true });
		}
	},

	render: function () {
		if (this.state.error) {
			return (
				<div className='alert alert-error'>{'Error: '+ this.state.error}</div>
			);
		}

		var Message = Messenger.Views.Message;
		var NewMessageForm = Messenger.Views.NewMessageForm,
				InfiniteScroll = React.addons.InfiniteScroll;

		var items = [];
		var messages = this.state.messages;

		for (var i = 0, _len = messages.length; i < _len; i++) {
			items.push(
				<li key={messages[i].cid}>
					<Message message={messages[i]} />
				</li>
			);
		}

		return (
			<div>
				<NewMessageForm conversation={this.props.conversation} />

				<ul className='unstyled conversation'>
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

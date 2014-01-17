/** @jsx React.DOM */

Messenger.Views.Conversations = React.createClass({
	displayName: 'Messenger.Views.Conversations',

	getInitialState: function () {
		return {
			models: []
		};
	},

	componentDidMount: function () {
		this.bindConversations(this.props.conversations);
	},

	componentWillReceiveProps: function (props) {
		if (this.props.conversations && props.conversations && this.props.conversations.cid !== props.conversations.cid) {
			this.unbindConversations(this.props.conversations);
		}
		this.bindConversations(props.conversations);
	},

	componentWillUnmount: function () {
		this.unbindConversations(this.props.conversations);
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
		this.setState({models: this.props.conversations.models()});
	},

	render: function () {
		var TruncatedMessage = Messenger.Views.TruncatedMessage;
		var items = [];
		var models = this.state.models;
		var conversation;
		for (var i = 0, _len = models.length; i < _len; i++) {
			conversation = models[i];
			items.push(
				<li key={conversation.cid}>
					<TruncatedMessage message={conversation.messages.first()} />
				</li>
			);
		}

		return (
			<ul className='unstyled'>
				{items}
			</ul>
		);
	}
});

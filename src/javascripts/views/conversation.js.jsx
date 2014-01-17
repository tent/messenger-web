/** @jsx React.DOM */

Messenger.Views.Conversation = React.createClass({
	displayName: 'Messenger.Views.Conversation',

	getInitialState: function () {
		return {
			messages: [],
			error: null
		};
	},

	componentDidMount: function () {
		this.bindConversation(this.props.conversation);
	},

	componentWillReceiveProps: function (props) {
		if (this.props.conversation !== props.conversation) {
			this.unbindConversation(this.props.conversation);
			this.bindConversation(props.conversation);
		}
	},

	componentWillUnmount: function () {
		this.unbindConversation(this.props.conversation);
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
		this.setState({ messages: this.props.conversation.messages.models() });
	},

	render: function () {
		if (this.state.error) {
			return (
				<div className='alert alert-error'>{'Error: '+ this.state.error}</div>
			);
		}

		var Message = Messenger.Views.Message;

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
			<ul className='unstyled'>
				{items}
			</ul>
		);
	}
});

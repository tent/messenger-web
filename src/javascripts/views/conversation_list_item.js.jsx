/** @jsx React.DOM */

Messenger.Views.ConversationListItem = React.createClass({
	displayName: 'Messenger.Views.ConversationListItem',

	handleClick: function () {
		this.props.openConversation(this.props.conversation);
	},

	render: function () {
		var TruncatedMessage = Messenger.Views.TruncatedMessage,
				RelativeTimestamp = Boiler.Views.RelativeTimestamp;
		var conversation = this.props.conversation;
		var latestMessage = conversation.messages.first();
		var messageNode;
		if (latestMessage) {
			messageNode = <TruncatedMessage message={latestMessage} />;
		} else {
			messageNode = '';
		}

		return (
			<li key={conversation.cid} className='clearfix' onClick={this.handleClick}>
				<div className='pull-right timestamp'>
					<small><RelativeTimestamp milliseconds={(latestMessage ? latestMessage.published_at : conversation.published_at)} /></small>
				</div>

				{messageNode}
			</li>
		);
	}
});

/** @jsx React.DOM */

Messenger.Views.ConversationListItem = React.createClass({
	displayName: 'Messenger.Views.ConversationListItem',

	handleClick: function () {
		this.props.openConversation(this.props.conversation);
	},

	render: function () {
		var TruncatedMessage = Messenger.Views.TruncatedMessage,
				RelativeTimestamp = Boiler.Views.RelativeTimestamp
				ContactName = Messenger.Views.ContactName,
				ContactAvatar = Messenger.Views.ContactAvatar;

		var conversation = this.props.conversation;
		var latestMessage = conversation.messages.first();
		var messageNode;
		if (latestMessage) {
			messageNode = <TruncatedMessage message={latestMessage} />;
		} else {
			return (
				<li key={conversation.cid} className='clearfix' onClick={this.handleClick}>
					<div className='pull-right timestamp'>
						<small><RelativeTimestamp milliseconds={(latestMessage ? latestMessage.published_at : conversation.published_at)} /></small>
					</div>
				</li>
			);
		}

		var numEntities = conversation.get('mentions.length') || 0;
		var entities = (conversation.mentions || []).slice(0, 4).map(function (mention) {
			return mention.entity;
		}).filter(function (entity) {
			return !!entity;
		});
		if (entities.indexOf(latestMessage.entity) === -1) {
			entities.unshift(latestMessage.entity);
		}
		entities = entities.slice(0, 4);

		var avatarNode = (
			<span key={entities[0]} className='pull-left avatar-container'>
				<ContactAvatar entity={entities[0]} className='avatar-medium' />
			</span>
		);

		var numOthersText = '';
		if (numEntities > 1) {
			numOthersText = <span> and {numEntities-1} {numEntities-1 === 1 ? ' other' : ' others'}</span>;
		}

		return (
			<li key={conversation.cid} className='clearfix' onClick={this.handleClick}>
				{avatarNode}
				<div className='pull-right timestamp'>
					<small><RelativeTimestamp milliseconds={(latestMessage ? latestMessage.published_at : conversation.published_at)} /></small>
				</div>

				<h3>
					<ContactName entity={entities[0]} />{numOthersText}
				</h3>

				{messageNode}
			</li>
		);
	}
});

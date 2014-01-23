/** @jsx React.DOM */

Messenger.Views.ConversationListItem = React.createClass({
	displayName: 'Messenger.Views.ConversationListItem',

	handleClick: function () {
		this.props.openConversation(this.props.conversation);
	},

	render: function () {
		var TruncatedMessage = Messenger.Views.TruncatedMessage,
				RelativeTimestamp = Boiler.Views.RelativeTimestamp,
				ContactName = Messenger.Views.ContactName,
				ContactAvatar = Messenger.Views.ContactAvatar,
				ConversationParticipants = Messenger.Views.ConversationParticipants;

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

		var entities = (conversation.mentions || []).slice(0, 4).map(function (mention) {
			return mention.entity;
		}).filter(function (entity) {
			return entity && entity !== conversation.entity;
		});

		var selfIndex = entities.indexOf(Messenger.current_entity);
		if (selfIndex !== -1) {
			entities = entities.slice(0, selfIndex).concat(entities.slice(selfIndex+1, entities.length));
		}

		var numEntities = entities.length;

		var numOthersText = '';
		if (numEntities > 1) {
			numOthersText = <span> and {numEntities-1} {numEntities-1 === 1 ? ' other' : ' others'}</span>;
		}

		var nameNode = '';
		if (entities.length) {
			nameNode = (<span>
				<ContactName entity={latestMessage.entity === Messenger.current_entity ? entities[0] : latestMessage.entity} />{numOthersText}
			</span>);
		}

		return (
			<li key={conversation.cid} className='clearfix' onClick={this.handleClick}>
				<ConversationParticipants conversation={conversation} />

				<div className='pull-right timestamp'>
					<small><RelativeTimestamp milliseconds={(latestMessage ? latestMessage.published_at : conversation.published_at)} /></small>
				</div>

				<h3>{nameNode}</h3>

				{messageNode}
			</li>
		);
	}
});

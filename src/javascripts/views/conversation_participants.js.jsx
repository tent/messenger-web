/** @jsx React.DOM */

Messenger.Views.ConversationParticipants = React.createClass({
	displayName: 'Messenger.Views.ConversationParticipants',

	render: function () {
		var ContactAvatar = Messenger.Views.ContactAvatar,
				ContactName = Messenger.Views.ContactName;

		var conversation = this.props.conversation;
		var entities = (conversation.mentions || []).map(function (mention) {
			return mention.entity;
		}).filter(function (entity) {
			return entity && entity !== conversation.entity;
		});

		var selfIndex = entities.indexOf(Messenger.current_entity);
		if (selfIndex !== -1) {
			entities = entities.slice(0, selfIndex).concat(entities.slice(selfIndex+1, entities.length));
		}

		var participants = entities.map(function (entity) {
			return (
				<li key={entity}>
					<ContactAvatar entity={entity} className='avatar-small' />
				</li>
			);
		});

		return (
			<ul className='unstyled participants'>
				{participants}
			</ul>
		);
	}
});

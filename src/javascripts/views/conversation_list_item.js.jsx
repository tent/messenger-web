/** @jsx React.DOM */

Messenger.Views.ConversationListItem = React.createClass({
	displayName: 'Messenger.Views.ConversationListItem',

	getInitialState: function () {
		return {
			active: false,
			deleting: false,
			deleteFailed: false
		};
	},

	handleClick: function () {
		if (this.state.deleting) {
			return false;
		}

		this.props.openConversation(this.props.conversation);
	},

	handleDeleteClick: function (e) {
		e.preventDefault();

		if (confirm("Delete conversation (and all messages owned within)?")) {
			var conversation = this.props.conversation;

			this.setState({
				deleting: true
			});

			this.props.conversation.performDelete({
				failure: function (res, xhr) {
					this.setState({
						deleting: false,
						deleteFailed: true
					});

					setTimeout(function () {
						throw Error(this.constructor.displayName +": failed to delete Conversation("+ JSON.stringify(conversation.entity) +", "+ JSON.stringify(conversation.id) +"): "+ xhr.status +" "+ JSON.stringify(res));
					}.bind(this), 0);
				}.bind(this)
			});
		}

		return false;
	},

	handleMouseEnter: function () {
		this.setState({
			active: true
		});
	},

	handleMouseLeave: function () {
		this.setState({
			active: false
		});
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

		var deleteBtn;
		if (this.state.active && !this.state.deleting && !this.state.deleteFailed && conversation.entity === Messenger.current_entity) {
			deleteBtn = <button className='btn btn-danger' title='Delete conversation' onClick={this.handleDeleteClick}>Delete</button>;
		} else {
			deleteBtn = '';
		}

		if (latestMessage) {
			messageNode = <TruncatedMessage message={latestMessage} />;
		} else {
			return (
				<li key={conversation.cid} className='clearfix' onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className={'clearfix'+ (this.state.deleting ? ' deleting' : '') + (this.state.deleteFailed ? ' delete-failed' : '')}>
					{deleteBtn}
					<div className='pull-right timestamp'>
						<small><RelativeTimestamp milliseconds={(latestMessage ? latestMessage.published_at : conversation.published_at)} /></small>
					</div>
				</li>
			);
		}

		var entities = (conversation.mentions || []).slice(0, 4).map(function (mention) {
			return mention.entity || conversation.entity;
		});

		if (entities.indexOf(conversation.entity) === -1) {
			entities.unshift(conversation.entity);
		}

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

		var participants = '';
		if (entities.length === 1) {
			participants = (
				<span className='pull-left avatar-container'>
					<ContactAvatar entity={entities[0]} className='avatar-medium' />
				</span>
			);
		} else {
			participants = <ConversationParticipants conversation={conversation} />;
		}

		return (
			<li key={conversation.cid} className='clearfix' onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className={'clearfix'+ (this.state.deleting ? ' deleting' : '') + (this.state.deleteFailed ? ' delete-failed' : '')}>
				{participants}

				<div className='pull-right timestamp'>
					<small><RelativeTimestamp milliseconds={(latestMessage ? latestMessage.published_at : conversation.published_at)} /></small>
				</div>

				<h3>{nameNode}</h3>

				<div className='pull-right'>
					{deleteBtn}
				</div>

				{messageNode}
			</li>
		);
	}
});

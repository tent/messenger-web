/** @jsx React.DOM */

Messenger.Views.Message = React.createClass({
	displayName: 'Messenger.Views.Message',

	getInitialState: function () {
		return {
			entity: null,
			name: null,
			avatarURL: null
		};
	},

	componentWillMount: function () {
		this.setState({
			entity: this.props.message.get('entity'),
			name: this.props.message.get('entity').replace(/^https?:\/\//, ''),
			avatarURL: null
		});

		var component = this;
		TentContacts.find(this.props.message.get('entity'), function (profile) {
			var avatarURL = null;
			if (profile.avatarDigest) {
				avatarURL = Messenger.client.getNamedURL('attachment', [{
					entity: profile.entity,
					digest: profile.avatarDigest
				}]);
			} else {
				// TODO: add sigil support
			}

			component.setState({
				entity: profile.entity,
				name: profile.name,
				avatarURL: avatarURL
			});
		});
	},

	render: function () {
		var RelativeTimestamp = Boiler.Views.RelativeTimestamp;
		var message = this.props.message;

		var avatar = '';
		if (this.state.avatarURL) {
			avatar = <img src={this.state.avatarURL} className='pull-left avatar-medium' />;
		}

		return (
			<div>
				{avatar}
				<div className='pull-right'>
					<small>
						<RelativeTimestamp milliseconds={message.published_at} />
					</small>
				</div>
				<h3 title={this.state.entity}>{this.state.name}</h3>
				<p>{message.get('content.text') || ''}</p>
			</div>
		);
	}
});

/** @jsx React.DOM */

Messenger.Views.ContactAvatar = React.createClass({
	displayName: 'Messenger.Views.ContactAvatar',

	getInitialState: function () {
		return {
			entity: null,
			name: null,
			avatarURL: null
		};
	},

	componentWillMount: function () {
		this.setState({
			entity: this.props.entity,
			name: null,
			avatarURL: null
		});

		var component = this;
		TentContacts.find(this.props.entity, function (profile) {
			var avatarURL;
			if (profile.avatarDigest) {
				avatarURL = Messenger.client.getNamedURL('attachment', [{
					entity: profile.entity,
					digest: profile.avatarDigest
				}]);
			} else {
				avatarURL = Messenger.Helpers.sigilURL(profile.entity, { w: 60 });
			}
			component.setState({
				entity: profile.entity,
				name: profile.name,
				avatarURL: avatarURL
			});
		});
	},

	render: function () {
		if (!this.state.avatarURL) {
			return <span />;
		}

		return (
			<img title={this.state.name +' - '+ this.state.entity} src={this.state.avatarURL} className='avatar-medium' />
		);
	}
});

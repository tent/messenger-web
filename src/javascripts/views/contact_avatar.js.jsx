/** @jsx React.DOM */

Messenger.Views.ContactAvatar = React.createClass({
	displayName: 'Messenger.Views.ContactAvatar',

	getInitialState: function () {
		return {
			entity: null,
			avatarURL: null
		};
	},

	componentWillMount: function () {
		this.setState({
			entity: this.props.entity,
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
				avatarURL: avatarURL
			});
		});
	},

	render: function () {
		if (!this.state.avatarURL) {
			return <span />;
		}

		return (
			<img title={this.state.entity} src={this.state.avatarURL} className='avatar-medium' />
		);
	}
});

/** @jsx React.DOM */

Messenger.Views.ContactName = React.createClass({
	displayName: 'Messenger.Views.ContactName',

	getInitialState: function () {
		return {
			entity: null,
			name: null
		};
	},

	componentWillMount: function () {
		this.setState({
			entity: this.props.entity,
			name: this.props.entity.replace(/^https?:\/\//, '')
		});

		TentContacts.find(this.props.entity, this.handleProfileChange);
		this.__listenerID = TentContacts.onChange(this.props.entity, this.handleProfileChange);
	},

	componentWillUnmount: function () {
		TentContacts.offChange(this.__listenerID);
	},

	handleProfileChange: function (profile) {
		this.setState({
			entity: profile.entity,
			name: profile.name
		});
	},

	render: function () {
		return (
			<span title={this.state.entity}>{this.state.name}</span>
		);
	}
});

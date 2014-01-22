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

		var component = this;
		TentContacts.find(this.props.entity, function (profile) {
			component.setState({
				entity: profile.entity,
				name: profile.name
			});
		});
	},

	render: function () {
		return (
			<span title={this.state.entity}>{this.state.name}</span>
		);
	}
});

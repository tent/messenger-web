/** @jsx React.DOM */

Messenger.Views.ContactSelector = React.createClass({
	displayName: 'Marbles.Views.ContactSelector',

	// callback accepts a single value/displayText object
	// must always produce a response (using the value as the displayText if nessisary)
	findContact: function (entity, callback) {
		TentContacts.find(entity, function (profile) {
			callback({
				value: profile.entity,
				displayText: profile.name
			});
		});
	},

	// callback accepts an array of value/displayText objects
	searchContacts: function (queryString, callback) {
		TentContacts.search(queryString, function (profiles) {
			if (profiles.length === 0) {
				if (/https?:\/\//.test(queryString)) {
					callback([{
						value: queryString,
						displayText: queryString
					}]);
				} else {
					callback([]);
				}
				return;
			}

			callback(profiles.map(function (profile) {
				return {
					value: profile.entity,
					displayText: profile.name
				};
			}));
		});
	},

	render: function () {
		var Multiselect = Messenger.Views.Multiselect;
		return (
			<Multiselect
				selectedValues={this.props.selectedEntities}
				itemLookup={this.findContact}
				itemFuzzyLookup={this.searchContacts}
				handleChangeSelection={this.props.handleChangeSelection} />
		);
	}
});

/** @jsx React.DOM */

Messenger.Views.Message = React.createClass({
	displayName: 'Messenger.Views.Message',

	getInitialState: function () {
		return {};
	},

	render: function () {
		var RelativeTimestamp = Boiler.Views.RelativeTimestamp;
		var message = this.props.message;

		return (
			<div>
				<div className='pull-right'>
					<small>
						<RelativeTimestamp milliseconds={message.published_at} />
					</small>
				</div>
				<p>{message.get('content.text') || ''}</p>
			</div>
		);
	}
});

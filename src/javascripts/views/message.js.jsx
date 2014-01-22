/** @jsx React.DOM */

Messenger.Views.Message = React.createClass({
	displayName: 'Messenger.Views.Message',

	render: function () {
		var RelativeTimestamp = Boiler.Views.RelativeTimestamp,
				ContactAvatar = Messenger.Views.ContactAvatar,
				ContactName = Messenger.Views.ContactName;
		var message = this.props.message;

		return (
			<div>
				<span className='pull-left'>
					<ContactAvatar entity={this.props.message.get('entity')} />
				</span>
				<div className='pull-right'>
					<small>
						<RelativeTimestamp milliseconds={message.published_at} />
					</small>
				</div>
				<h3>
					<ContactName entity={this.props.message.get('entity')} />
				</h3>
				<p>{message.get('content.text') || ''}</p>
			</div>
		);
	}
});

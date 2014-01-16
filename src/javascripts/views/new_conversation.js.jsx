/** @jsx React.DOM */

(function () {

	Messenger.Views.NewConversation = React.createClass({
		displayName: 'Messenger.Views.NewConversation',

		getInitialState: function () {
			return {};
		},

		handleSubmit: function (e) {
			e.preventDefault();

			var conversation = this.props.conversation;
			var messageBody = this.refs.body.getDOMNode().value;
			var recipients = this.refs.recipients.getDOMNode().value;

			conversation.setRecipients(recipients.split(/\s*,\s*/));
			conversation.setNewMessage({
				content: {
					text: messageBody
				}
			});

			conversation.save({
				success: this.handleSubmitSuccess,
				failure: this.handleSubmitFailure
			});
		},

		handleSubmitSuccess: function (res, xhr) {
			this.setState({
				alert: {
					type: 'success',
					text: 'Message sent'
				}
			});
			this.props.handleSubmitSuccess(res, xhr);
		},

		handleSubmitFailure: function (res, xhr) {
			var msg = res.error || 'Something went wrong';
			this.setState({
				alert: {
					type: 'danger',
					text: msg
				}
			});
		},

		clearAlert: function () {
			this.setState({ alert: null });
		},

		render: function () {
			var alertNode = '';
			if (this.state.alert) {
				alertNode = (
					<div className={'alert alert-'+ this.state.alert.type}>
						<span className='times' onClick={this.clearAlert} />
						{this.state.alert.text}
					</div>
				);
			}
			return (
				<form className='message-form' onSubmit={this.handleSubmit}>
					{alertNode}

					<label>
						To:<br/>
						<input ref='recipients' className='bb' type='text' placeholder='https://example.com, https://example.org, ...' />
					</label>

					<textarea ref='body' className='bb' placeholder='Message Body' rows='3' />

					<div className='clearfix'>
						<button type='submit' className='btn btn-primary pull-right'>Send</button>
					</div>
				</form>
			);
		}
	});

})();

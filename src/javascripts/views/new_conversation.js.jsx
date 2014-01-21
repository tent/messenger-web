/** @jsx React.DOM */

(function () {

	Messenger.Views.NewConversation = React.createClass({
		displayName: 'Messenger.Views.NewConversation',

		getInitialState: function () {
			return {
				submitting: false
			};
		},

		handleSubmit: function (e) {
			e.preventDefault();
			this.setState({ submitting: true });
			this.props.conversation.save({
				success: this.handleSubmitSuccess,
				failure: this.handleSubmitFailure
			});
		},

		handleChangeContactSelection: function (entities) {
			this.props.conversation.setRecipients(entities);
		},

		handleChangeBody: function () {
			var messageBody = this.refs.body.getDOMNode().value;
			this.props.conversation.newMessage.set('content.text', messageBody);
		},

		handleSubmitSuccess: function (res, xhr) {
			this.setState({
				alert: {
					type: 'success',
					text: 'Message sent'
				},
				submitting: false
			});
			this.props.handleSubmitSuccess(res, xhr);
		},

		handleSubmitFailure: function (res, xhr) {
			var msg = res.error || 'Something went wrong';
			this.setState({
				alert: {
					type: 'danger',
					text: msg
				},
				submitting: false
			});
		},

		getRecipients: function () {
			var recipients = [];
			var mentions = this.props.conversation.mentions || [];
			for (var i = 0, _len = mentions.length; i < _len; i++) {
				recipients.push(mentions[i].entity);
			}
			return recipients;
		},

		getBody: function () {
			return this.props.conversation.get('newMessage.content.text');
		},

		clearAlert: function () {
			this.setState({ alert: null });
		},

		render: function () {
			var ContactSelector = Messenger.Views.ContactSelector;

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
						<ContactSelector handleChangeSelection={this.handleChangeContactSelection} selectedEntities={this.getRecipients()} />
					</label>

					<textarea ref='body' className='bb' placeholder='Message Body' rows='3' onChange={this.handleChangeBody} defaultValue={this.getBody()} />

					<div className='clearfix'>
						<button type='submit' disabled={this.state.submitting} className='btn btn-primary pull-right'>{this.state.submitting ? 'Sending' : 'Send'}</button>
					</div>
				</form>
			);
		}
	});

})();

/** @jsx React.DOM */

Messenger.Views.NewMessageForm = React.createClass({
	displayName: 'Messenger.Views.NewMessageForm',

	getInitialState: function () {
		return {
			message: null,
			error: null,
			submitting: false
		};
	},

	componentWillMount: function () {
		this.setState({
			message: this.props.conversation.newMessage
		});
	},

	handleSubmit: function (e) {
		e.preventDefault();

		this.setState({submitting: true});

		var conversation = this.props.conversation;

		this.state.message.set('refs', [{
			post: conversation.id,
			entity: conversation.entity
		}]);
		this.state.message.set('mentions', [{
			post: conversation.id,
			entity: conversation.entity
		}].concat(conversation.mentions));

		this.state.message.save({
			success: this.handleSubmitSuccess,
			failure: this.handleSubmitFailure
		});
	},

	handleSubmitSuccess: function () {
		this.props.conversation.messages.prependModels([this.state.message]);

		this.props.conversation.initNewMessage();

		// reset form
		this.refs.body.getDOMNode().value = '';
		var state = this.getInitialState();
		state.message = this.props.conversation.newMessage;
		this.replaceState(state);
	},

	handleSubmitFailure: function (res, xhr) {
		this.setState({
			submitting: false,
			error: res.error || 'Something went wrong. Error code: '+ xhr.status
		});
	},

	handleChangeBody: function () {
		var messageBody = this.refs.body.getDOMNode().value;
		this.state.message.set('content.text', messageBody);
	},

	render: function () {
		var alertNode = '';
		if (this.state.error) {
			alertNode = (
				<div className='alert alert-error'>
					{this.state.error}
				</div>
			);
		}

		return (
			<form className='message-form clearfix' onSubmit={this.handleSubmit}>
				{alertNode}

				<textarea
					ref='body'
					className='bb'
					placeholder='Message Body'
					rows='3'
					onChange={this.handleChangeBody}
					defaultValue={this.state.message.get('content.text') || ''} />

				<button type='submit' disabled={this.state.submitting} className='btn btn-primary pull-right'>{this.state.submitting ? 'Sending' : 'Send'}</button>
			</form>
		);
	}
});

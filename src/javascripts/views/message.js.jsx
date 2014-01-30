/** @jsx React.DOM */

Messenger.Views.Message = React.createClass({
	displayName: 'Messenger.Views.Message',

	getInitialState: function () {
		return {
			active: false,
			deleting: false,
			deleteFailed: false
		};
	},

	handleDeleteClick: function (e) {
		e.preventDefault();

		if (confirm("Delete message?")) {
			var message = this.props.message;

			this.setState({
				deleting: true
			});

			message.performDelete({
				failure: function (res, xhr) {
					this.setState({
						deleting: false,
						deleteFailed: true
					});

					setTimeout(function () {
						throw Error(this.constructor.displayName +": failed to delete Message("+ JSON.stringify(message.entity) +", "+ JSON.stringify(message.id) +"): "+ xhr.status +" "+ JSON.stringify(res));
					}.bind(this), 0);
				}.bind(this)
			});
		}

		return false;
	},

	handleMouseEnter: function () {
		this.setState({
			active: true
		});
	},

	handleMouseLeave: function () {
		this.setState({
			active: false
		});
	},

	render: function () {
		var RelativeTimestamp = Boiler.Views.RelativeTimestamp,
				ContactAvatar = Messenger.Views.ContactAvatar,
				ContactName = Messenger.Views.ContactName;
		var message = this.props.message;

		var deleteBtn;
		var deleteBtn;
		if (this.state.active && !this.state.deleting && !this.state.deleteFailed) {
			deleteBtn = <button className='btn btn-danger' title='Delete conversation' onClick={this.handleDeleteClick}>Delete</button>;
		} else {
			deleteBtn = '';
		}

		return (
			<div className='message clearfix' onClick={this.handleClick} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} className={'clearfix'+ (this.state.deleting ? ' deleting' : '') + (this.state.deleteFailed ? ' delete-failed' : '')}>

				<span className='pull-left avatar-container'>
					<ContactAvatar entity={this.props.message.get('entity')} className='avatar-medium' />
				</span>
				<div className='pull-right'>
					<small>
						<RelativeTimestamp milliseconds={message.published_at} />
					</small>
				</div>
				<h3>
					<ContactName entity={this.props.message.get('entity')} />
				</h3>

				<div className='pull-right'>
					{deleteBtn}
				</div>

				<p>{message.get('content.text') || ''}</p>
			</div>
		);
	}
});

//= require ./contacts_api
//= require ./messenger
//= require_self

Messenger.once('ready', function () {
	TentContacts.daemonURL = Messenger.config.CONTACTS_URL;
	TentContacts.run();
});

Boiler.once('config:ready', Messenger.run, Messenger, { args: false });
Boiler.fetchConfig();

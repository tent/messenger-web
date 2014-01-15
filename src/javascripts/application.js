//= require ./messenger
//= require_self

Boiler.once('config:ready', Messenger.run, Messenger, { args: false });
Boiler.fetchConfig();

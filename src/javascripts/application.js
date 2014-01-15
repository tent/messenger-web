//= require ./messenger
//= require_self

Boiler.once('config:ready', Boiler.run, null, { args: false });
Boiler.fetchConfig();

(function () {

	var Contacts = window.TentContacts = {};
	Contacts.displayName = "window.TentContacts";

	// TODO: configure Contacts.daemonURL

	Contacts.ready = false;

	Contacts.__id_counter = 0;

	Contacts.__callbacks = {};
	Contacts.__callbackBindings = {};

	// list of requests created before daemon activated.
	Contacts.sendQueue = [];

	Contacts.run = function () {
		if (Contacts.iframe) {
			// Don't load more than once
			return;
		}

		if (!Contacts.daemonURL) {
			throw Error(Contacts.displayName +".daemonURL must be set!");
		}

		window.addEventListener("message", Contacts.receiveMessage, false);

		function sendPing() {
			var initData = {
				name: 'init',
				id: 'init',
				args: [Contacts.entity, Contacts.serverMetaPost, Contacts.credentials],
				callback: Contacts.daemonReady
			};
			Contacts.deliverMessage(initData);
		}

		var iframe = document.createElement('iframe');
		iframe.src = Contacts.daemonURL;

		// hide it
		iframe.style.width = '0px';
		iframe.style.height = '0px';
		iframe.style.margin = '0px';
		iframe.style.padding = '0px';
		iframe.style.border = 'none';

		// insert into the DOM
		document.body.appendChild(iframe);

		Contacts.iframe = iframe;

		iframe.addEventListener("load", sendPing, false);
	};

	Contacts.stop = function (callback) {
		Contacts.credentials = null;
		Contacts.entity = null;
		Contacts.sendQueue = [];
		Contacts.ready = false;
		Contacts.deliverMessage({
			name: 'deinit',
			id: 'deinit',
			callback: callback
		});
	};

	Contacts.daemonReady = function () {
		Contacts.ready = true;

		// Deliver backlog
		for (var i = 0, _ref = Contacts.sendQueue, _len = _ref.length; i < _len; i++) {
			Contacts.deliverMessage(_ref[i]);
		}
		Contacts.sendQueue = [];
	};

	Contacts.sendMessage = function (name, args, callback, thisArg) {
		var data = {
			name: name,
			args: args,
			id: "req."+ Contacts.__id_counter++,
			callback: callback,
			thisArg: thisArg || null
		};

		if (Contacts.ready) {
			Contacts.deliverMessage(data);
		} else {
			Contacts.sendQueue.push(data);
		}
	};

	Contacts.deliverMessage = function (data) {
		Contacts.__callbacks[data.id] = data.callback;
		Contacts.__callbackBindings[data.id] = data.thisArg;
		delete data.callback;
		delete data.thisArg;

		Contacts.iframe.contentWindow.postMessage(data, Contacts.daemonURL);
	};

	Contacts.receiveMessage = function (event) {
		if (Contacts.daemonURL.substr(0, event.origin.length) !== event.origin) {
			return; // ignore everything not from the iframe
		}

		if (event.data.name === 'ready') {
			// API daemon is ready
			Contacts.daemonReady();
			return;
		}

		// each message must be an object
		// with `id`, and `res` members

		if (!event.data.id) {
			throw Error(Contacts.displayName +".receiveMessage: Missing id: "+ JSON.stringify(event.data));
		}

		var callback = Contacts.__callbacks[event.data.id];
		delete Contacts.__callbacks[event.data.id];

		var thisArg = Contacts.__callbackBindings[event.data.id];
		delete Contacts.__callbackBindings[event.data.id];

		if (typeof callback === null) {
			// Allow callback to be explicitly omitted
			return;
		}

		if (typeof callback !== 'function') {
			throw Error(Contacts.displayName +".receiveMessage: Invalid callback: "+ JSON.stringify(callback) +" for event: "+ JSON.stringify(event.data));
		}

		callback.call(thisArg, event.data.res);
	};

	Contacts.find = function (entity, callback, thisArg) {
		Contacts.sendMessage('find', [entity], callback, thisArg);
	};

	Contacts.search = function (queryString, callback, thisArg) {
		Contacts.sendMessage('search', [queryString], callback, thisArg);
	};

})();

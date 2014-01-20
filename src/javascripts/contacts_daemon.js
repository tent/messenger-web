(function () {

	// Simple localStorage abstration
	var Cache = function () {
		this.namespace = 'c';
	};
	Cache.prototype.expandKey = function (key) {
		return this.namespace +':'+ key;
	};
	Cache.prototype.set = function (key, val) {
		if (!window.localStorage) {
			return;
		}
		window.localStorage.setItem(this.expandKey(key), JSON.stringify(val));
	};
	Cache.prototype.get = function (key) {
		if (!window.localStorage) {
			return null;
		}
		return JSON.parse(window.localStorage.getItem(this.expandKey(key)));
	};
	Cache.prototype.remove = function (key) {
		if (!window.localStorage) {
			return;
		}
		window.localStorage.removeItem(this.expandKey(key));
	};

	var Contacts = {};

	Contacts.allowedOrigin = /^.*$/; // TODO: make this configurable with an array of hostnames

	// listen to postMessage
	Contacts.run = function () {
		window.addEventListener("message", Contacts.receiveMessage, false);
	};

	Contacts.init = function () {
		Contacts.setCredentials.apply(null, arguments);
		Contacts.cache = new Cache();
	};

	Contacts.deinit = function () {
		Contacts.client = null;
		Contacts.cache = null;
	};

	Contacts.receiveMessage = function (event) {
		if (!Contacts.allowedOrigin.test(event.origin)) {
			return; // ignore everything from "un-trusted" hosts
		}

		// each message must be an object
		// with `name`, `args`, and `id` members
		// corresponding to the function to be called,
		// the args to call it with, and the id with
		// which the response should be associated.

		var callback = function (res) {
			event.source.postMessage({
				id: event.data.id,
				res: res
			}, event.origin);
		};

		switch (event.data.name) {
			case "find":
				Contacts.find.apply(null, event.data.args.concat([callback]));
			break;

			case "search":
				Contacts.find.apply(null, event.data.search.concat([callback]));
			break;

			case "init":
				Contacts.init.apply(null, event.data.args || []);
				callback();
			break;

			case "deinit":
				Contacts.deinit.apply(null, event.data.args || []);
				callback();
			break;
		}
	};

	Contacts.setCredentials = function (entity, serverMetaPost, credentials) {
		Contacts.client = new TentClient(entity, {
			serverMetaPost: serverMetaPost,
			credentials: credentials
		});
	};

	// fetch new relationships and cached update names and avatars
	Contacts.sync = function () {
	};

	/*
	 * public API
	 */

	// find contact by entity
	Contacts.find = function (entity, callback) {
	};

	// find contacts with name or entity matching queryString
	Contacts.search = function (queryString, callback) {
	};

	Contacts.run();

})();

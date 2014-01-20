(function () {

	var Contacts = {};

	Contacts.allowedOrigin = /^.*$/; // TODO: make this configurable with an array of hostnames

	// listen to postMessage
	Contacts.run = function () {
		window.addEventListener("message", Contacts.receiveMessage, false);
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

			case "ping":
				callback();
			break;
		}
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

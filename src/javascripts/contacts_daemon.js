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

	// Simple scoring algorithm
	StringScore = function (str, abbr) {
		str = str.toLowerCase();
		abbr = abbr.toLowerCase();

		if (str === abbr) {
			return 1;
		}

		var index = str.indexOf(abbr);

		if (index === -1) {
			return 0;
		}

		if (index === 0) {
			return 1;
		}

		return abbr.length / str.length;
	};

	var Contacts = {};
	Contacts.displayName = "TentContacts (Daemon)";

	var __syncInterval;

	Contacts.allowedOrigin = /^.*$/; // TODO: make this configurable with an array of hostnames

	// listen to postMessage
	Contacts.run = function () {
		window.addEventListener("message", Contacts.receiveMessage, false);
	};

	Contacts.init = function () {
		Contacts.setCredentials.apply(null, arguments);
		Contacts.cache = new Cache();
		__syncInterval = setInterval(Contacts.sync, 14400000); // sync every 4 hours
		Contacts.sync();
	};

	Contacts.deinit = function () {
		Contacts.client = null;
		Contacts.cache = null;
		clearInterval(__syncInterval);
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
				Contacts.search.apply(null, event.data.args.concat([callback]));
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
		if (!Contacts.client) {
			throw Error(Contacts.displayName +": Can not sync without Tent client!");
		}

		var cursor = Contacts.cache.get('cursor');
		if (cursor && ((Date.now() - cursor.updated_at) > 86400000)) {
			// refresh everything every 24 hours
			cursor = null;
		}
		if (!cursor) {
			cursor = {
				since: 0,
				updated_at: Date.now()
			};
		}

		var handleSuccess = function (res, xhr) {
			if (!res.posts.length) {
				// empty response
				return;
			}

			// update cursor
			var latestPost = res.posts[0];
			cursor = {
				since: latestPost.received_at +" "+ latestPost.version.id,
				updated_at: Date.now()
			};
			Contacts.cache.set('cursor', cursor);

			// fetch the next page
			Contacts.fetch({
				since: cursor.since
			}, handleSuccess);

			// cache returned profiles
			var entity, profile, name, avatarDigest;
			for (entity in res.profiles) {
				profile = res.profiles[entity];
				name = profile.name || entity.replace(/^https?:\/\//, '');
				avatarDigest = profile.avatar_digest;
				Contacts.cacheProfile(entity, name, avatarDigest);
			}
		};

		Contacts.fetch({
			since: cursor.since
		}, handleSuccess);
	};

	Contacts.fetch = function (params, successCallback) {
		params.types = ["https://tent.io/types/relationship/v0#"];
		params.profiles = "mentions";
		Contacts.client.getPostsFeed({
			params: [params],
			callback: {
				success: successCallback,
				failure: function (res, xhr) {
					throw Error(Contacts.displayName +": Failed to fetch relationships - "+ xhr.status +": "+ JSON.stringify(res));
				}
			}
		});
	};

	// returns cached object with entity URIs
	// as keys and profile names as values
	// (used for searching).
	Contacts.getCacheManifest = function () {
		if (!Contacts.cache) {
			return null;
		}
		return Contacts.cache.get('manifest');
	};

	Contacts.cacheProfile = function (entity, name, avatarDigest) {
		Contacts.cache.set(entity, {
			name: name,
			avatarDigest: avatarDigest
		});

		var manifest = Contacts.getCacheManifest() || {};
		manifest[entity] = name;
		Contacts.cache.set('manifest', manifest);
	};

	Contacts.getCachedProfile = function (entity) {
		return Contacts.cache.get(entity);
	};

	/*
	 * public API
	 */

	// find contact by entity
	Contacts.find = function (entity, callback) {
		callback( Contacts.getCachedProfile(entity) );
	};

	// find contacts with name or entity matching queryString
	Contacts.search = function (queryString, callback) {
		var manifest = Contacts.getCacheManifest() || {};
		var profiles = [];
		var entity, name, score, profile;
		for (entity in manifest) {
			if (!manifest.hasOwnProperty(entity)) {
				continue;
			}
			name = manifest[entity];

			score = (StringScore(entity, queryString) + StringScore(name, queryString)) / 2;
			if (score === 0) {
				continue;
			}

			profile = Contacts.cache.get(entity);
			if (!profile) {
				continue;
			}

			profile.score = score;
			profiles.push(profile);
		}

		// sort matched profiles in order of score (high to low)
		profiles = profiles.sort(function (a, b) {
			a = a.score;
			b = b.score;
			if (a > b) {
				return -1;
			}
			if (a < b) {
				return 1;
			}
			return 0;
		});

		callback(profiles);
	};

	Contacts.run();

})();

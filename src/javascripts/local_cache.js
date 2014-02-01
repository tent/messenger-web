(function () {

	var Cache = function (namespace) {
		this.__namespace = namespace;
	};

	Cache.prototype.setItem = function (key, val) {
		if (!window.localStorage) {
			return;
		}
		window.localStorage.setItem(this.__expandKey(key), JSON.stringify(val));
	};

	Cache.prototype.getItem = function (key) {
		if (!window.localStorage) {
			return null;
		}
		return JSON.parse(window.localStorage.getItem(this.__expandKey(key)));
	};

	Cache.prototype.removeItem = function (key) {
		if (!window.localStorage) {
			return;
		}
		window.localStorage.removeItem(this.__expandKey(key));
	};

	Cache.prototype.__expandKey = function (key) {
		return this.__namespace +':'+ key;
	};

	Messenger.LocalCache = new Cache('m');

})();


/** Does the storage method exist (cookie or localStorage), and not thow exceptions? */
function exists(get) {
    try {
        var storage = get();
    } catch (exc) {
        return false;
    }

    var exists = (storage !== null) && (storage !== undefined)
    return exists && (typeof(storage) === 'object' || typeof(storage) === 'string');
}

/**
 * This mocks a storage method, and serves as a base for working storage implementations. This isn't abstract, and can
 * be instantiated.
 */
function MockStow(name) {
    this.name = name;
    this.storage = null;
    this.state = {};
}

MockStow.exists = function () {
    return true;
};

/** Load the state from storage. */
MockStow.prototype.load = function () {
    this.state = {};
};

/** Store the state. */
MockStow.prototype.save = function () {};

/** Delete all stored data. */
MockStow.prototype.clear = function () {
    this.state = {};
};

/** Get stored data by its key. */
MockStow.prototype.getItem = function (key) {
    return this.state[key];
};

/** Store data with a key. */
MockStow.prototype.setItem = function (key, value) {
    this.state[key] = value;
};

/** Delete data with a particular key. */
MockStow.prototype.removeItem = function (key) {
    delete this.state[key];
};








function AbstractStow(name) {
    MockStow.call(this, name);
    this.storage = localStorage;
}

LocalStow.exists = function () {
    return exists(function () {return localStorage});
};

LocalStow.prototype = Object.create(MockStow.prototype);
LocalStow.prototype.constructor = LocalStow;

LocalStow.prototype.load = function () {
    var state = this.storage[this.name];

    if (typeof state === 'string') {
        this.state = JSON.parse(state);
    } else {
        this.state = {};
    }
};

LocalStow.prototype.save = function () {
    this.storage[this.name] = JSON.stringify(this.state);
};

LocalStow.prototype.clear = function () {
    delete this.storage[this.name];
    this.state = {};
};































function LocalStow(name) {
    MockStow.call(this, name);
    this.storage = localStorage;
}

LocalStow.exists = function () {
    return exists(function () {return localStorage});
};

LocalStow.prototype = Object.create(MockStow.prototype);
LocalStow.prototype.constructor = LocalStow;

LocalStow.prototype.load = function () {
    var state = this.storage[this.name];

    if (typeof state === 'string') {
        this.state = JSON.parse(state);
    } else {
        this.state = {};
    }
};

LocalStow.prototype.save = function () {
    this.storage[this.name] = JSON.stringify(this.state);
};

LocalStow.prototype.clear = function () {
    delete this.storage[this.name];
    this.state = {};
};

function CookieStow(name) {
    MockStow.call(this, name);
    this.storage = new Cookie();
}

CookieStow.exists = function () {
    return exists(function () {return document.cookie});
};

CookieStow.prototype = Object.create(MockStow.prototype);
CookieStow.prototype.constructor = CookieStow;

CookieStow.prototype.load = function () {
    var state = this.storage.getItem(this.name);

    if (typeof state === 'string') {
        this.state = JSON.parse(state);
    } else {
        this.state = {};
    }
};

CookieStow.prototype.save = function () {
    this.storage.setItem(this.name, JSON.stringify(this.state));
};

CookieStow.prototype.clear = function () {
    delete this.storage.removeItem(this.name);
    this.state = {};
};

/*
function JSave(name, strategy) {
}

JSave.prototype.name = function() {
    return this.storage.name;
};

JSave.prototype.clear = function() {
    this.storage[this.name] = undefined;
};

JSave.prototype.edit = function(callback) {
    var state = this.storage[this.name] === undefined ? {} : JSON.parse(this.storage[this.name]);

    callback(state);

    this.storage[this.name] = JSON.stringify(state);
};

JSave.prototype.get = function() {
    this.storage[this.name] = undefined;
};

JSave.prototype.set = function() {
    this.storage[this.name] = undefined;
};

JSave.prototype.length = function() {
    this.storage[this.name] = undefined;
};
*/

function Cookie() {
    /** A wrapper around `document.cookie` that makes it substantially more pleasant to deal with. */
    this.cookie = document.cookie;
}

Cookie.expires = function (days) {
    var date = new Date();

    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    return date
};

Cookie.prototype.getItem = function (key) {

    var assigned = key + '=';

    var splitCookie = this.cookie.split(';');

    for (var i = 0; i < splitCookie.length; i++) {

        var cookie = splitCookie[i];

        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }

        if (cookie.indexOf(assigned) == 0) {
            var subString = cookie.substring(assigned.length, cookie.length);

            return subString.length ? subString : undefined;
        }
    }

    return undefined;
};

Cookie.prototype.setItem = function (key, value, expires, path) {
    if (value !== undefined) {
        if (expires === undefined) {
            var expires = Cookie.expires(365);
        }

        if (path === undefined) {
            var path = '/';
        }

        var data = key + '=' + value;
        var expiresData = 'expires=' + expires.toString();
        var pathData = 'path=' + path;

        this.cookie = data + ';' + expiresData + ';' + pathData;
    } else {
        this.removeItem(key);
    }
};

Cookie.prototype.removeItem = function (key) {
    this.setItem(key, '', Cookie.expires(-1)); // The cookie expired yesterday.
};
















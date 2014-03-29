
JSave = {};

/** Does the storage method exist (cookie or localStorage), and not thow exceptions? */
JSave.exists = function (get) {
    try {
        var storage = get();
    } catch (exc) {
        return false;
    }

    var exists = (storage !== null) && (storage !== undefined);
    return exists && (typeof(storage) === 'object' || typeof(storage) === 'string');
};

/** Runtime verification that the storage works. */
JSave.works = function (storage) {
    // todo:
};

/**
 * A wrapper around `document.cookie` that makes cookies substantially more pleasant to deal with. This gives cookies
 * an interface similar to HTML5's `localStorage`.
 */
JSave.Cookie = function () {
};

JSave.Cookie.expires = function (days) {
    var date = new Date();

    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    return date;
};

JSave.Cookie.getItem = function (key) {

    var assigned = key + '=';

    var splitCookie = document.cookie.split(';');

    for (var i = 0; i < splitCookie.length; i++) {

        var cookie = splitCookie[i];

        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1, cookie.length);
        }

        if (cookie.indexOf(assigned) == 0) {
            var subString = cookie.substring(assigned.length, cookie.length);

            return subString.length ? subString : null;
        }
    }

    return null;
};

JSave.Cookie.setItem = function (key, value, expires, path) {

    if (value !== undefined) {
        if (expires === undefined) {
            var expires = JSave.Cookie.expires(365);
        }

        if (path === undefined) {
            var path = '/';
        }

        var data = key + '=' + value;
        var expiresData = 'expires=' + expires.toString();
        var pathData = 'path=' + path;

        document.cookie = data + ';' + expiresData + ';' + pathData;
    } else {
        this.removeItem(key);
    }
};

JSave.Cookie.removeItem = function (key) {
    this.setItem(key, '');
};


/** An abstract base for storage objects. */
JSave.AbstractStow = function (name) {
    this.name = name;
    this.storage = null;
    this.state = {};
};

JSave.AbstractStow.exists = function () {
    return true;
};

/** Load the state from storage. */
JSave.AbstractStow.prototype.load = function () {
    var state = this.storage.getItem(this.name);

    if (typeof state === 'string') {
        this.state = JSON.parse(state);
    } else {
        this.state = {};
    }
};

/** Store the state. */
JSave.AbstractStow.prototype.save = function () {
    this.storage.setItem(this.name, JSON.stringify(this.state));
};

/** Delete all stored data. */
JSave.AbstractStow.prototype.clear = function () {
    this.storage.removeItem(this.name);
    this.state = {};
};

/** Get stored data by its key. */
JSave.AbstractStow.prototype.getItem = function (key) {
    var value = this.state[key];
    return value === undefined ? null : value;
};

/** Store data with a key. */
JSave.AbstractStow.prototype.setItem = function (key, value) {
    this.state[key] = value;
};

/** Delete data with a particular key. */
JSave.AbstractStow.prototype.removeItem = function (key) {
    delete this.state[key];
};


/** This mocks a storage method; it acts the same as a real storage method, but has no actual persistence mechanism. */
JSave.MockStow = function (name) {
    JSave.AbstractStow.call(this, name);
};

JSave.MockStow.prototype = Object.create(JSave.AbstractStow.prototype);
JSave.MockStow.prototype.constructor = JSave.MockStow;

JSave.MockStow.exists = function () {
    return true;
};

JSave.MockStow.prototype.load = function () {
    this.state = {};
};

JSave.MockStow.prototype.save = function () {};

JSave.MockStow.prototype.clear = function () {
    this.state = {};
};


/** A storage object which utilizes HTML5's `localStorage` as it's method of persistence. */
JSave.LocalStow = function (name) {
    JSave.AbstractStow.call(this, name);
    this.storage = localStorage;
};

JSave.LocalStow.prototype = Object.create(JSave.AbstractStow.prototype);
JSave.LocalStow.prototype.constructor = JSave.LocalStow;

JSave.LocalStow.exists = function () {
    return JSave.exists(function () {return localStorage});
};


/** A storage object which utilizes cookies as it's method of persistence. */
JSave.CookieStow = function (name) {
    JSave.AbstractStow.call(this, name);
    this.storage = JSave.Cookie;
}

JSave.CookieStow.prototype = Object.create(JSave.AbstractStow.prototype);
JSave.CookieStow.prototype.constructor = JSave.CookieStow;

JSave.CookieStow.exists = function () {
    return JSave.exists(function () {return document.cookie});
};


/**
 * This object functions as an abstraction of several different persistence mechanisms. It has as a single easy to use
 * interface for cookies and HTML5's `localStorage`. This can also be configured so that any individual persistence
 * mechanism has a fallback if it doesn't exist or is disabled.
 */
JSave.JSave = function (name, strategy) {
    this.stow = JSave.LocalStow(name);
}

JSave.JSave.prototype.name = function () {
    return this.stow.name;
};

JSave.JSave.prototype.clear = function () {
    this.stow.clear();
};

JSave.JSave.prototype.edit = function (callback) {
    var state = this.storage[this.name] === undefined ? {} : JSON.parse(this.storage[this.name]);

    callback(state);

    this.storage[this.name] = JSON.stringify(state);
};

JSave.JSave.prototype.getItem = function (key) {
    return this.stow.getItem(key);
};

JSave.JSave.prototype.setItem = function (key, value) {
    this.stow.setItem(key, value);
};

JSave.JSave.prototype.removeItem = function (key) {
    this.stow.removeItem(key);
};


/**
 * This library acts as a persistence abstraction layer for client-side JavaScript. This allows for the persistent
 * storage of JSON compatible objects using HTML5's `localStorage` or cookies, using a single interface. This
 * facilitates robust client-side storage, using `localStorage` as the preferred mechanism while utilizing cookies as a
 * fallback.
 */

jSave = {};

/** Does the storage method exist (cookie or localStorage), and not thow exceptions? */
jSave._exists = function (get) {
    try {
        var storage = get();
    } catch (exc) {
        return false;
    }

    var exists = (storage !== null) && (storage !== undefined);
    return exists && (typeof(storage) === 'object' || typeof(storage) === 'string');
};

/** Runtime verification that the storage works. */
jSave._works = function (storage) {
    try {
        storage.setItem('a', '0')
        storage.setItem('b', '1')
        if (storage.getItem('a') !== '0') {
            return false;
        }

        storage.removeItem('a')
        if (storage.getItem('a') !== null && storage.getItem('a') !== undefined) {
            return false;
        }

        if (storage.getItem('b') !== '1') {
            return false;
        }

        storage.removeItem('b')
        if (storage.getItem('b') !== null && storage.getItem('b') !== undefined) {
            return false;
        }
    } catch (exc) {
        return false;
    }

    return true;
};

/** This takes an array of strategies and returns the first one that works. If nothing works it returns `null`. */
jSave._fallback = function (strategy) {
    if (!Array.isArray(strategy)) {
        strategy = [strategy];
    }

    for (var i = 0; i < strategy.length; i++) {
        if (strategy[i].works()) {
            return strategy[i];
        }
    }

    return null;
}

/**
 * A wrapper around `document.cookie` that makes cookies substantially more pleasant to deal with. This gives cookies
 * an interface similar to HTML5's `localStorage`.
 */
jSave.Cookie = function () {
};

jSave.Cookie.expires = function (days) {
    var date = new Date();

    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

    return date;
};

jSave.Cookie.getItem = function (key) {

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

jSave.Cookie.setItem = function (key, value, expires, path) {

    if (value !== undefined) {
        if (expires === undefined) {
            var expires = jSave.Cookie.expires(365);
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

jSave.Cookie.removeItem = function (key) {
    this.setItem(key, '');
};


/** An abstract base for storage objects. */
jSave.AbstractStow = function (name) {
    this.name = name;
    this.storage = null;
    this.state = {};
};

jSave.AbstractStow.works = function () {
    return true;
};

/** Load the state from storage. */
jSave.AbstractStow.prototype.load = function () {
    var state = this.storage.getItem(this.name);

    if (typeof state === 'string') {
        this.state = JSON.parse(state);
    } else {
        this.state = {};
    }
};

/** Store the state. */
jSave.AbstractStow.prototype.save = function () {
    this.storage.setItem(this.name, JSON.stringify(this.state));
};

/** Delete all stored data. */
jSave.AbstractStow.prototype.clear = function () {
    this.storage.removeItem(this.name);
    this.state = {};
};

/** Get stored data by its key. */
jSave.AbstractStow.prototype.getItem = function (key) {
    var value = this.state[key];
    return value === undefined ? null : value;
};

/** Store data with a key. */
jSave.AbstractStow.prototype.setItem = function (key, value) {
    this.state[key] = value;
};

/** Delete data with a particular key. */
jSave.AbstractStow.prototype.removeItem = function (key) {
    delete this.state[key];
};


/** This mocks a storage method; it acts the same as a real storage method, but has no actual persistence mechanism. */
jSave.MockStow = function (name) {
    jSave.AbstractStow.call(this, name);
};

jSave.MockStow.prototype = Object.create(jSave.AbstractStow.prototype);
jSave.MockStow.prototype.constructor = jSave.MockStow;

jSave.MockStow.works = function () {
    return true;
};

jSave.MockStow.prototype.load = function () {
    this.state = {};
};

jSave.MockStow.prototype.save = function () {};

jSave.MockStow.prototype.clear = function () {
    this.state = {};
};


/** A storage object which utilizes HTML5's `localStorage` as it's method of persistence. */
jSave.LocalStow = function (name) {
    jSave.AbstractStow.call(this, name);
    this.storage = localStorage;
};

jSave.LocalStow.prototype = Object.create(jSave.AbstractStow.prototype);
jSave.LocalStow.prototype.constructor = jSave.LocalStow;

jSave.LocalStow.works = function () {
    return jSave._exists(function () {return localStorage}) ? jSave._works(localStorage) : false;
};


/** A storage object which utilizes cookies as it's method of persistence. */
jSave.CookieStow = function (name) {
    jSave.AbstractStow.call(this, name);
    this.storage = jSave.Cookie;
}

jSave.CookieStow.prototype = Object.create(jSave.AbstractStow.prototype);
jSave.CookieStow.prototype.constructor = jSave.CookieStow;

jSave.CookieStow.works = function () {
    return jSave._exists(function () {return document.cookie}) ? jSave._works(jSave.Cookie) : false;
};


/**
 * This object functions as an abstraction of several different persistence mechanisms. It has as a single easy to use
 * interface for cookies and HTML5's `localStorage`. By default it's configured so that if `localStorage` isn't present
 * or is disabled, it falls back to using cookies, and if that doesn't work it uses a mockup (so things upstream don't
 * break).
 */
jSave.JSave = function (name, strategy) {
    if (strategy === undefined) {
        strategy = [jSave.LocalStow, jSave.CookieStow];
    }

    var stowType = jSave._fallback(strategy);

    if (stowType === null) {
        this.stow = new jSave.MockStow(name); // Storage works, even if it isn't really persistent.
    } else {
        this.stow = new stowType(name);
    }

    Object.defineProperty(this, 'state', {'get': function() {return this.stow.state}});
    Object.defineProperty(this, 'name', {'get': function() {return this.stow.name},
                                         'set': function(value) {this.stow.name = value}});
}

jSave.JSave.prototype.load = function () {
    this.stow.load();
};

jSave.JSave.prototype.save = function () {
    this.stow.save();
};

jSave.JSave.prototype.clear = function () {
    this.stow.clear();
};

jSave.JSave.prototype.getItem = function (key) {
    return this.stow.getItem(key);
};

jSave.JSave.prototype.setItem = function (key, value) {
    this.stow.setItem(key, value);
};

/** Set the value for a key, if the key's value is currently `null`. */
jSave.JSave.prototype.setDefault = function (key, value) {
    if (this.stow.getItem(key) === null) {
        this.stow.setItem(key, value);
    }
};

jSave.JSave.prototype.removeItem = function (key) {
    this.stow.removeItem(key);
};


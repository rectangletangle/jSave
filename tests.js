

function testGetSetRemove(object) {
    object.removeItem('foo');
    object.removeItem('bar');

    ok(object.getItem('bar') === null);

    object.setItem('bar', 'a');
    ok(object.getItem('bar') === 'a');

    object.setItem('bar', 'b');
    ok(object.getItem('bar') === 'b');

    object.removeItem('bar');
    ok(object.getItem('bar') === null);

    object.setItem('foo', 'a');
    ok(object.getItem('foo') === 'a');
}

function testGetSetObject(object) {
    var otherObject = {'a': [1, 2, 3]}
    object.setItem('foo', otherObject);
    deepEqual(object.getItem('foo'), {'a': [1, 2, 3]});

    object.setItem('foo', null);
    ok(object.getItem('foo') === null);

    object.setItem('foo', undefined);
    ok(object.getItem('foo') === null);
}

function testSetDefault(object) {
    ok(object.getItem('a') === null);

    object.setDefault('a', 0)
    ok(object.getItem('a') === 0);

    object.setDefault('a', 1)
    ok(object.getItem('a') === 0);

    object.setItem('a', undefined)
    object.setDefault('a', 1)
    ok(object.getItem('a') === 1);

    object.setItem('a', null)
    object.setDefault('a', 2)
    ok(object.getItem('a') === 2);
}

function testMockStowState() {
    var stow = new jSave.MockStow('foo');

    deepEqual(stow.state, {});

    stow.load();
    deepEqual(stow.state, {});

    stow.setItem('qux', 312);
    deepEqual(stow.state, {'qux': 312});

    stow.save();
    deepEqual(stow.state, {'qux': 312});

    stow.load();
    deepEqual(stow.state, {});

    stow.setItem('x', 2);
    stow.clear();
    deepEqual(stow.state, {});
};

function testStorage(stow, storage, stowType) {
    storage.setItem('bazz', 'f');
    storage.removeItem('foo');

    deepEqual(stow.state, {});

    stow.load();
    deepEqual(stow.state, {});

    stow.setItem('a', 1);
    stow.setItem('b', [1, 2, 3]);

    ok(storage.getItem('foo') === null);

    stow.save();
    deepEqual(JSON.parse(storage.getItem('foo')), {'a': 1, 'b': [1, 2, 3]});

    stow.setItem('c', 43);
    deepEqual(JSON.parse(storage.getItem('foo')), {'a': 1, 'b': [1, 2, 3]});

    stow.save();
    deepEqual(JSON.parse(storage.getItem('foo')), {'a': 1, 'b': [1, 2, 3], 'c': 43});

    storage.setItem('bar', 'a');
    var baz = new stowType('baz');
    baz.setItem('qux', 312);
    baz.save();
    stow.clear();
    ok(storage.getItem('foo') === null);
    ok(storage.getItem('bar') === 'a');
    deepEqual(JSON.parse(storage.getItem('baz')), {'qux': 312});
    ok(storage.getItem('bazz') === 'f');
}

test('test exists', function () {
    ok(!jSave._exists(function () {return null}));
    ok(!jSave._exists(function () {return undefined}));
    ok(!jSave._exists(function () {return 1}));
    ok(!jSave._exists(function () {throw "This doesn't work"; return {}}));

    ok(jSave._exists(function () {return {}}));
    ok(jSave._exists(function () {return localStorage}));
});

test('test works', function () {
    var mockStorage = {'getItem': function (key) {return this[key]},
                       'setItem': function (key, value) {this[key] = value},
                       'removeItem': function (key) {delete this[key]}}
    ok(jSave._works(mockStorage));

    mockStorage['getItem'] = function () {};
    ok(!jSave._works(mockStorage));

    mockStorage['getItem'] = function () {throw 'foo'};
    ok(!jSave._works(mockStorage));
});

test('test fallback', function () {

    var doesWork = {'works': function () {return true}}
    var doesntWork = {'works': function () {return false}}

    ok(jSave._fallback(doesntWork) === null);
    ok(jSave._fallback([doesntWork, doesntWork]) === null);
    ok(jSave._fallback([]) === null);

    var a = Object.create(doesWork);
    a.name = 'a'

    ok(jSave._fallback(a).name === 'a');
    ok(jSave._fallback([a, doesntWork]).name === 'a');
    ok(jSave._fallback([doesntWork, a]).name === 'a');

    var b = Object.create(doesWork);
    b.name = 'b'

    ok(jSave._fallback([a, b]).name === 'a');
    ok(jSave._fallback([b, a]).name === 'b');
    ok(jSave._fallback([doesntWork, b, a]).name === 'b');
    ok(jSave._fallback([doesntWork, doesntWork, a]).name === 'a');
});

test('test MockStow', function () {
    var name = 'foo';

    ok(jSave.MockStow.works() === true);
    testGetSetRemove(new jSave.MockStow(name));
    testGetSetObject(new jSave.MockStow(name));
    testMockStowState();
});

test('test LocalStow', function () {
    var name = 'foo';

    ok(jSave.LocalStow.works() === true);
    testGetSetRemove(new jSave.LocalStow(name));
    testGetSetObject(new jSave.LocalStow(name));
    testStorage(new jSave.LocalStow(name), localStorage, jSave.LocalStow);
});

test('test Cookie', function () {
    testGetSetRemove(jSave.Cookie);
});

test('test CookieStow', function () {
    var name = 'foo';

    ok(jSave.CookieStow.works() === true);
    testGetSetRemove(new jSave.CookieStow(name));
    testGetSetObject(new jSave.CookieStow(name));
    testStorage(new jSave.CookieStow(name), jSave.Cookie, jSave.CookieStow);
});

test('test JSave', function () {
    var name = 'foo';

    ok(new jSave.JSave(name).name === 'foo');

    var strategies = [jSave.LocalStow, jSave.CookieStow, [], undefined];

    for (var i = 0; i < strategies.length; i++) {
        testGetSetRemove(new jSave.JSave(name, strategies[i]));
        testGetSetObject(new jSave.JSave(name, strategies[i]));
        testSetDefault(new jSave.JSave(name, strategies[i]));
    }

    testStorage(new jSave.JSave(name), localStorage, jSave.JSave);
    testStorage(new jSave.JSave(name, jSave.LocalStow), localStorage, jSave.JSave);
    testStorage(new jSave.JSave(name, jSave.CookieStow), jSave.Cookie, jSave.JSave);
});


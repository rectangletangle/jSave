

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

function testMockStowState() {
    var stow = new JSave.MockStow('foo');

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
}

test('test exists', function () {
    ok(!JSave.exists(function () {return null}));
    ok(!JSave.exists(function () {return undefined}));
    ok(!JSave.exists(function () {return 1}));
    ok(!JSave.exists(function () {throw "This doesn't work"; return {}}));

    ok(JSave.exists(function () {return {}}));
    ok(JSave.exists(function () {return localStorage}));
});

test('test MockStow', function () {
    var name = 'foo';

    ok(JSave.MockStow.exists() === true);
    testGetSetRemove(new JSave.MockStow(name));
    testGetSetObject(new JSave.MockStow(name));
    testMockStowState();
});

test('test LocalStow', function () {
    var name = 'foo';

    ok(JSave.LocalStow.exists() === true);
    testGetSetRemove(new JSave.LocalStow(name));
    testGetSetObject(new JSave.LocalStow(name));
    testStorage(new JSave.LocalStow(name), localStorage, JSave.LocalStow);
});

test('test Cookie', function () {
    testGetSetRemove(JSave.Cookie);
});

test('test CookieStow', function () {
    var name = 'foo';

    ok(JSave.CookieStow.exists() === true);
    testGetSetRemove(new JSave.CookieStow(name));
    testGetSetObject(new JSave.CookieStow(name));
    testStorage(new JSave.CookieStow(name), JSave.Cookie, JSave.CookieStow);
});


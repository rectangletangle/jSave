

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
}

function testMockStowState() {
    var stow = new MockStow('foo');

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
    ok(!exists(function () {return null}));
    ok(!exists(function () {return undefined}));
    ok(!exists(function () {return 1}));
    ok(!exists(function () {throw "This doesn't work"; return {}}));

    ok(exists(function () {return {}}));
    ok(exists(function () {return localStorage}));
});

test('test MockStow', function () {
    var name = 'foo';

    ok(MockStow.exists() === true);
    testGetSetRemove(new MockStow(name));
    testGetSetObject(new MockStow(name));
    testMockStowState();
});

test('test LocalStow', function () {
    var name = 'foo';

    ok(LocalStow.exists() === true);
    testGetSetRemove(new LocalStow(name));
    testGetSetObject(new LocalStow(name));
    testStorage(new LocalStow(name), localStorage, LocalStow);
});

test('test Cookie', function () {
    testGetSetRemove(Cookie);
});

test('test CookieStow', function () {
    var name = 'foo';

    ok(CookieStow.exists() === true);
    testGetSetRemove(new CookieStow(name));
    testGetSetObject(new CookieStow(name));
    testStorage(new CookieStow(name), Cookie, CookieStow);
});




function testGetSetRemove(object) {
    ok(object.getItem('bar') === undefined);

    object.setItem('bar', 'a');
    ok(object.getItem('bar') === 'a');

    object.setItem('bar', 'b');
    ok(object.getItem('bar') === 'b');

    object.removeItem('bar');
    ok(object.getItem('bar') === undefined);

    object.setItem('foo', 'a');
    ok(object.getItem('foo') === 'a');

    object.setItem('foo', undefined);
    ok(object.getItem('foo') === undefined);
}

function testGetSetObject(object) {
    var otherObject = {'a': [1, 2, 3]}
    object.setItem('foo', otherObject);
    deepEqual(object.getItem('foo'), {'a': [1, 2, 3]});
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

function testState(stowType) {
    var stow = new stowType('foo');

    localStorage.clear();

    deepEqual(stow.state, {});

    stow.load();
    deepEqual(stow.state, {});

    stow.setItem('a', 1);
    stow.setItem('b', [1, 2, 3]);

    ok(localStorage['foo'] === undefined);

    stow.save();
    deepEqual(JSON.parse(localStorage['foo']), {'a': 1, 'b': [1, 2, 3]});

    stow.setItem('c', 43);
    deepEqual(JSON.parse(localStorage['foo']), {'a': 1, 'b': [1, 2, 3]});

    stow.save();
    deepEqual(JSON.parse(localStorage['foo']), {'a': 1, 'b': [1, 2, 3], 'c': 43});

    localStorage['bar'] = 'a';
    var baz = new stowType('baz');
    baz.setItem('qux', 312);
    baz.save();
    stow.clear();
    ok(localStorage['foo'] === undefined);
    ok(localStorage['bar'] === 'a');
    deepEqual(JSON.parse(localStorage['baz']), {'qux': 312});
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
    ok(MockStow.exists() === true);

    var stow = new MockStow('foo');

    testGetSetRemove(stow);
    testGetSetObject(stow);
    testMockStowState();
});

test('test LocalStow', function () {
    ok(LocalStow.exists() === true);

    var stow = new LocalStow('foo');

    testGetSetRemove(stow);
    testGetSetObject(stow);
    testState(LocalStow);
});

test('test Cookie', function () {
    testGetSetRemove(new Cookie());
});

test('test CookieStow', function () {
    ok(CookieStow.exists() === true);

    var stow = new CookieStow('foo');

    testGetSetRemove(stow);
    testGetSetObject(stow);
});


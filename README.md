jSave
======
This library acts as a persistence abstraction layer for client-side
JavaScript. Any JSON compatible object can be persisted using either HTML5's
`localStorage` or cookies. This facilitates robust client-side storage using
`localStorage` as the preferred mechanism, then seamlessly falling back to
cookies if that doesn't work.

## Usage:
This demo rotates through the colors red, blue, and green using `localStorage`
for persistence. If that doesn't work, it gracefully falls back to cookies.
Although only strings are stored in this demo, any JSON compatible object can
be stored. The calls to `JSON.parse` and `JSON.stringify` are done
automatically.

```html
<!doctype html>

<html>
    <head>
        <meta charset="utf-8">
        <title>jSave Demo</title>
        <script src="jsave/jsave.js"></script>
    </head>

    <body>
        <div id="someDiv" style='width:200px;height:200px;'></div>

        <script>
            someDiv = document.getElementById('someDiv');

            // The name `divColor` corresponds to a `localStorage` key.
            state = new jSave.JSave('divColor');

            state.load();

            color = state.getDefault('color', 'blue');

            if (color === 'blue') {
                color = 'red';
            } else if (color === 'red') {
                color = 'green';
            } else {
                color = 'blue';
            }

            someDiv.style.backgroundColor = color;

            state.setItem('color', color);
            state.save();
        </script>
    </body>
</html>
```

## Dependencies:
* QUnit (only for testing)

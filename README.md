jSave
======
This library acts as a persistence abstraction layer for client-side
JavaScript. This allows for the persistent storage of JSON compatible objects
using HTML5's `localStorage` or cookies, using a single interface. This
facilitates robust client-side storage, using `localStorage` as the preferred
mechanism while utilizing cookies as a fallback.

## Usage:
This demo rotates through the colors red, blue, and green using `localStorage`
for persistence. If that doesn't work, it gracefully falls back to using
cookies for persistence. Although only strings are stored in this demo, any
JSON compatible object can be stored. The calls to `JSON.parse` and
`JSON.stringify` are done automatically.

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

This is example client for [PDC] that provides somewhat comfortable to view
contacts for components.

[PDC]: https://github.com/release-engineering/product-definition-center


# Usage

Set up your server url in src/serversetting.json, then enjoy.


# Development

Install `npm` (probably from your package manager).

    $ npm install
    $ make
    # Builds a JS bundle ...
    # Open index.html in browser for testing
    
    $ make watch
    # Automatically rebuild the bundle

    $ make dist
    # create single file version in dist/index.html

If you did not install node module globally, you need to add
`node_modules/.bin` to your `PATH`.

# Known issue

If you met error 'Authorization Required', please open the server you configured and check if this connection is untrusted.
If so, please add the exception in your browser.

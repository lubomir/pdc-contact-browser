This is example client for [PDC] that provides somewhat comfortable to view
contacts for components.

[PDC]: https://github.com/release-engineering/product-definition-center


# Usage

Set up your server url in serversetting.json, then enjoy.


# Development

Install `npm` (probably from your package manager).

    $ npm install
    $ npm start 
    # Listening at http://localhost:3000/
    # Open http://localhost:3000/ in browser for testing
    
If you did not install node module globally, you need to add
`node_modules/.bin` to your `PATH`.

# Known issue

If you met error 'Authorization Required', please open the server you configured and check if this connection is untrusted.
If so, please add the exception in your browser.

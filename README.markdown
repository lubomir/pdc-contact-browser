This is example client for [PDC] that provides somewhat comfortable to view and
edit contacts for components.

[PDC]: https://github.com/release-engineering/product-definition-center


# Usage

Hit the cog buggon in the top right corner, set up your servers and enjoy.


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

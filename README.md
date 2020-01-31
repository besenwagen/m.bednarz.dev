# ECMAScript modules

> Make JavaScript (sic) great again with web-based ECMAScript modules.

## Runtime environments

- contemporary web browsers
- [Deno](https://deno.land/)
- [Node.js](https://nodejs.org/) >= 13

Node.js currently only supports file URLs.
You can use
[rollup.js](https://rollupjs.org/guide/)
with
[rollup-plugin-url-resolve](https://github.com/mjackson/rollup-plugin-url-resolve)
to create a bundle from the web.

## M is for Module

### Universal

    import * from https://m.bednarz.dev/*.js

### Browser

    import * from https://m.bednarz.dev/browser/*.js

### Deno

    import * from https://m.bednarz.dev/deno/*.js

### Node.js

    import * from https://m.bednarz.dev/node/*.js

## Universal modules

The following is available on all runtimes.

- [ECMAScript 2019](https://ecma-international.org/ecma-262/10.0/)
- [Console Standard](https://console.spec.whatwg.org)
- [URL Standard](https://spec.whatwg.org)
- globals
    - `setTimeout`
    - `clearTimeout`
    - `setInterval`
    - `clearInterval`

## License

MIT

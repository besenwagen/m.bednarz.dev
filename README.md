# ECMAScript modules [![License: AGPL v3][license-image]][license-url]

> Make JavaScript (sic) great again with native, web-based ECMAScript modules.

## Why?

The problems `npm` (the CLI tool, the registry, the company) 
creates outweigh the problems it is supposed to solve.
You can either face that or 
[wait for another christmas and die of a broken heart](https://en.wikipedia.org/wiki/James_Stockdale#The_Stockdale_Paradox).

Although this repository has nothing to do with the 
[Entropic Package Manager](https://www.entropic.dev/),
you should really watch
[The economics of open source by C J Silverio](https://www.youtube.com/watch?v=MO8hZlgK5zc)
at *JSConf EU 2019* anyway if you never did.

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

*GNU Affero General Public License* version 3 or later

SPDX-License-Identifier: AGPL-3.0-or-later

[license-image]: https://img.shields.io/github/license/eric-bednarz-dev/ECMAScript-modules
[license-url]:   https://www.gnu.org/licenses/agpl-3.0

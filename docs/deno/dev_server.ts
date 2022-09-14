/**
 * Copyright 2020 Eric Bednarz <https://m.bednarz.dev>
 * SPDX-License-Identifier: EUPL-1.2
 */
import {
  Application,
  Context,
  HttpError,
  send,
  Status,
} from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { parse } from "https://deno.land/std@0.120.0/flags/mod.ts";
import { blue, green, red } from "https://deno.land/std@0.120.0/fmt/colors.ts";

/* global Deno */

const { args, exit } = Deno;
const { assign } = Object;

//#region CLI

const parsedArguments = parse(args);

const cliHelp = `
Simple HTTPS development server.

Options:
-c: certificates path
-p: port (3443)
-d: document root (public)
-h: host name (localhost)

Certificates are read from
- [certificates path]/cert.pem
- [certificates path]/key.pem

Set -c during installation:

$ deno install --allow-read --allow-net path/to/this/module.ts -c /path/to/certificates

For more installation options, run

$ deno install --help
`;

const cliError = `
Error: the -c option is required.
Use --help for more information.
`;

if (parsedArguments.help === true) {
  console.info(cliHelp);
  exit(0);
}

if (!parsedArguments.c) {
  console.error(cliError);
  exit(1);
}

const configurable = {
  certificates: parsedArguments.c,
  hostname: parsedArguments.h || "0.0.0.0",
  port: parsedArguments.p || 3443,
};

const documentRoot = parsedArguments.d || "public";

//#endregion

//#region Configuration

interface Configurable {
  hostname: string;
  port: number;
  certificates: string;
}

interface Configuration {
  hostname: string;
  port: number;
  secure: true;
  certFile: string;
  keyFile: string;
}

const configure = ({
  certificates,
  hostname,
  port,
}: Configurable): Configuration => ({
  hostname,
  port,
  secure: true,
  certFile: `${certificates}/cert.pem`,
  keyFile: `${certificates}/key.pem`,
});

const configuration = configure(configurable);

//#endregion

function log({ request, response }: Context) {
  const {
    method,
    url: {
      pathname,
      search,
    },
  } = request;
  const code = String(response.status);
  const error = /^[45]/.test(code);
  const status = error ? red(code) : green(code);

  console.info(status, method, blue(pathname + search));
}

const app = new Application();

//#region Error Middleware

const html = (message: string, lang = "en"): string => (`
<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${message}</title>
    <style>
    body {
      margin: 0;
      padding: 2em;
      color: #000;
      background: #eee;
      font: 1em/1.5 Gerorgia, serif;
    }

    main {
      max-width: 40em;
      margin: 0 auto;
      border: 1px solid #f00;
      padding: 2em;
      color: #000;
      background: #fff;
    }

    h1 {
      margin: 0;
      font-weight: normal;
      font-size: 1.5em;
    }
    </style>
  </head>
  <body>
    <main>
      <h1>${message}</h1>
    </main>
  </body>
</html>
`.trimLeft());

app.use(async (context, next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof HttpError) {
      const reason = error.expose ? error.message : Status[error.status];
      assign(context.response, {
        status: error.status,
        body: html(`${error.status} - ${reason}`),
      });
      log(context);
    } else if (error instanceof Error) {
      assign(context.response, {
        status: 500,
        body: html("500 - Internal Server Error"),
      });
      log(context);
      console.error(red(error.message));
      console.error(error.stack);
    }
  }
});

//#endregion

app.use(async (context, next) => {
  await next();
  log(context);
});

//#region Static Files & SPA Middleware

const index = "index.html";
const root = `${Deno.cwd()}/${documentRoot}`;

const isSpaPathComponent = (pathComponent: string): boolean =>
  !/\.[a-z\d]+$/i.test(pathComponent);

app.use(async (context) => {
  const { pathname } = context.request.url;

  try {
    await send(context, pathname, {
      root,
      index,
    });
  } catch (error) {
    if (isSpaPathComponent(pathname)) {
      await send(context, `/${index}`, {
        root,
        index,
      });
    } else {
      throw error;
    }
  }
});

//#endregion

app.addEventListener("listen", ({
  hostname,
  port,
}) => {
  const origin = `https://${hostname}:${port}`;
  console.info(`Listening on ${blue(origin)}`);
});

app.listen(configuration);

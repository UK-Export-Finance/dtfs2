# Adding and updating scripts

This document provides instructions for adding and updating scripts located in
the `scripts` directory of a service's root folder. These scripts are
JavaScript (JS) or TypeScript (TS) files that are compiled and included in the
service's templates for client-side functionality.

## Adding a new script

1. Add the script to the scripts directory in the services root directory (as
either a JS or TS file).
    - For example, add a script with path `/scripts/your-script.ts`
2. Update the `webpack.common.config.js` file in the services root directory
by adding a new property to the entry object.
    - For example, if you have a script with path
    `your-service/scripts/your-script.ts`, then add the following property to
    the entry object in the webpack config:
    `yourScript: './scripts/your-script.ts'`
3. Run npm run build from the services root to recompile the scripts.
4. Add a new script tag to the bottom of the `index.njk` template (or a
specific pages `njk` template), using the `/assets/js/...` path in the script
tags `src` attribute.
    - Note that `assets/` is the `public/` directory in the services root
    directory.
    - Also note that if your original source file is in TS, it will be compiled
    to JS (and placed in the `public/` directory referenced above) and you want
    to use this compiled (JS) version here.
    - For example, we may add the following script tag to
    `your-service/templates/index.njk`: `<script
    src="/assets/js/your-script.js" type="text/javascript" integrity=""
    crossorigin="anonymous"></script>`
    (note that we’ll add a value for the integrity attribute below).
5. Follow the steps below to update the integrity hash in the relevant `njk`
template.

## Updating existing scripts

1. Make changes to the script file.
2. Run npm run build from the services root to recompile the scripts.
3. Follow the steps below to update the integrity hash in the relevant `njk`
template.

## Updating the scripts integrity hash

Whenever modifications are made to the compiled scripts, we must update the
integrity attribute in the script tag where they are included.

1. Use the following command (or similar) to generate a new integrity hash for
the compiled script: `echo "sha512-$(openssl dgst -sha512 -binary <
/path/to/public/js/yourScriptHere.js | openssl base64 -A)"`
2. Copy this output and update the integrity attribute value in the
corresponding script tag in the relevant `njk` template.
    - For example:
      - If the script tag is currently: `<script
      src="/assets/js/your-script.js" type="text/javascript"
      integrity="sha512-3UQ..." crossorigin="anonymous"></script>
      `
      - And the output from the above command is `sha512-QLv...`
      - Our updated script tag would be: `<script
      src="/assets/js/your-script.js" type="text/javascript"
      integrity="sha512-QLv..." crossorigin="anonymous"></script>`

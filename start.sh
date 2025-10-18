# This script starts a Node.js microservice with environment-specific behavior.
# - If NODE_ENV is not "production":
#     - Installs `nodemon` globally for automatic restarts on file changes.
#     - Runs the microservice in development mode using "npm run start:dev" with the specified MICROSERVICE.
# - If NODE_ENV is "production":
#     - Runs the microservice in production mode using "npm run start" with the specified MICROSERVICE.
# The script uses "set -euo pipefail" for safer error handling.


#!/bin/sh
set -euo pipefail

if [ "$NODE_ENV" != "production" ]; then
    npm i nodemon
    if ["$MICROSERVICE" == "portal-ui"]; then
        exec npx nodemon server/index.ts --config ../nodemon.json
    else
        exec npm run start:dev -w "$MICROSERVICE"
    fi
else
    exec npm run start -w "$MICROSERVICE"
fi

#!/bin/sh
set -euo pipefail

# =============================================================================
# Script Name: start-microservice.sh
# Description:
#   Starts a Node.js microservice with environment-specific behavior.
#
#   - In non-production environments (NODE_ENV != "production"):
#       • Ensures `nodemon` is installed for automatic restarts on file changes.
#       • If the MICROSERVICE is "portal-ui", starts the UI server directly with nodemon.
#       • Otherwise, runs the microservice in development mode via "npm run start:dev".
#
#   - In production (NODE_ENV == "production"):
#       • Runs the microservice in production mode via "npm run start".
#
# Usage:
#   NODE_ENV=<environment> MICROSERVICE=<service_name> ./start-microservice.sh
#
# Environment Variables:
#   NODE_ENV      - Defines the environment ("production" or other).
#   MICROSERVICE  - The name of the microservice to start (e.g., "portal-ui").
#
# Exit Codes:
#   0   - Successful execution.
#   >0  - Error occurred during execution (script stops automatically).
#
# Notes:
#   - Uses `set -euo pipefail` for strict error handling:
#       • -e : Exit on first command failure.
#       • -u : Treat unset variables as errors.
#       • -o pipefail : Fail if any command in a pipeline fails.
#   - Uses `exec` to replace the current shell process with the app process,
#     ensuring proper signal handling in containers (e.g., Docker).
# =============================================================================

if [ "${NODE_ENV:-}" != "production" ]; then
    # -------------------------------------------------------------------------
    # Development mode setup
    # -------------------------------------------------------------------------

    # Ensure nodemon is installed (for automatic restarts on file changes)
    if ! command -v nodemon >/dev/null 2>&1; then
        npm install nodemon
    fi

    # Start the portal UI directly if the selected service is "portal-ui"
    if [ "${MICROSERVICE:-}" = "portal-ui" ]; then
        exec npx nodemon portal-ui/server/index.ts --config ./nodemon.json
    else
        # Start other microservices using the dev command
        exec npm run start:dev -w "${MICROSERVICE}"
    fi

else
    # -------------------------------------------------------------------------
    # Production mode setup
    # -------------------------------------------------------------------------

    # Start the microservice using the production start script
    exec npm run start -w "${MICROSERVICE}"
fi

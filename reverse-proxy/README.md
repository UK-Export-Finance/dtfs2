## Purpose

The primary purpose of this reverse-proxy service is to serve two different user interfaces, the Portal (BSS) UI and the GEF UI, from the same location for end-users. Despite being distinct services with different port numbers, the reverse-proxy configuration is set up to route requests accordingly.

This service sets the Nginx configuration to use a specific template file (`./default.conf.template`) for routing requests.

## Routing Logic

The routing logic of the reverse-proxy is as follows:

- Any request with `/gef/` in the path is forwarded to the GEF UI.
- All other requests are forwarded to the Portal (BSS) UI.

## Running Locally

To run this reverse-proxy service locally, you can follow these steps:

1. Start all services from the root directory using Docker Compose:

   ```shell
   npm run start
   ```

This service seems to be an essential part of the overall architecture, enabling seamless access to both the Portal (BSS) and GEF user interfaces for end-users while ensuring that requests are directed to the appropriate service based on the path.

# reverse-proxy

This services sets the nginx config to `./default.conf.template`.

## Why

For the end user, the Portal (BSS) UI and the GEF UI are served in the same place.

However, both the UI's are different services/servers with different port numbers.

This reverse-proxy config forwards anything with `/gef/` in the path, to the GEF UI. Otherwise, everything else is forwarded to the Portal (BSS) UI.

## Running locally

1. Start all services from the root directory

    ```shell
    docker-compose up
    ```
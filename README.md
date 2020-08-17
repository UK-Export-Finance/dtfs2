![Pipeline](https://github.com/notbinary/dtfs2/workflows/Pipeline/badge.svg)

# UKEF Trade Finance Service

This repository contains the code for the UK Export Finance Trade Finance Service.

## Setup

Prerequisites

 * Version 13 or later of `node` with a corresponding `npm`
 * Docker and Docker Compose

### Tech stack

The main technologies here are:

 * node/npm
 * webpack
 * Govuk and MoJ Ddesign systems
 * mongodb
 * docker and docker-compose
 * cypress

### Secrets

Along with `secrets/set_jwt_keypair.sh` you'll need the following scripts to set environment variables when running the build:

 * `set_azure_api_keys.sh`
 * `set_companies_house_api_key.sh`
 * `set_gov_notify_api_key.sh`

The list of variables can be seen in the environment build workdlows under [`.github/workflows`](.github/workflows)

### Steps

 * Clone this repo
 * Add the environment variable scripts noted above to the `secrets` folder
 * Run `npm run pipeline` in the root directory of the repo to run a full build and test
 * After running the pipeline, you can use `docker-compose up` to start up your local environment
 * To refresh the data in the database, navigate to `utils/mock-data-loader`, run `npm install`and then `node re-insert-mocks.js`

NB this code has been developed on Mac OS and runs in Linux containers. You may need to adjust some steps if you need to run it on Windows.

### Testing

With docker running, execute all tests with:
```
npm install && npm run pipeline
```

### Running the world locally

Launch everything with:
```
docker-compose up --build
```

NB `--build` is optional - it will rebuild the contaners.

From another terminal, stop everything cleanly with:
```
docker-compose down
```

Portal can then be seen at:
```
http://localhost:5000
```

The API is at:
```
http://localhost:5001/
```
(although these endpoints mostly require access tokens to interact with..)
```
http://localhost:5001/v1/deals
```

a mongoDB container will have been started:
* to connect a client from your local machine, connect to `localhost:27017` as `root/r00t`


### Git workflow

Setup git hooks with:
```
npm install
```

When a commit is pushed to master, heroku branches are updated and pushed.

Github actions will run a build and push of container images to Azure, which will be picked up and deployed automatically by the Dev environment. If testing is successful, images will be promoted to the test environment.

Pushing to the `infrastructure` branch will trigger a refresh of the infrastructure in each environment. This updates the App Services and sets environment variables and secrets.

Pushing to the `demo` branch will trigger tagging of the current development container images with `demo` tag, which will in turn trigger a redeployment of the demo environment. This ensures the demo environment isn't affected by CI/CD and is only refreshed on demand.


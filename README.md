# dtfs2

![Pipeline](https://github.com/notbinary/dtfs2/workflows/Pipeline/badge.svg)

### Setup

Prerequisites

 * Version 13 or later of `node` with a corresponding `npm`
 * Docker and Docker Compose

Steps

 * clone this repo
 * if you have a Companies House API key, it can be stored in a one-line text file called `companies_house_api_key.txt` (named in `.gitignore`). This will be picked up and used by `bin/pipeline.sh`. E.g.: `echo "abc123456XYZ" > companies_house_api_key.txt`
 * API keys for Azure filestore requires file './secrets/set_azure_api_keys.sh' ( ./secrets folder is added to .gitignore), whcih set the relevant .env variables. add 'source [YOUR_PROJECT_PATH]/secrets/set_azure_api_keys.sh' to .bashrc to automatically set env variables. set_azure_api_keys.sh has been pinned to dtfs2-dev channel on UKEF-DTFS slack
 * run `npm install` in the root directory of the repo
 * run `docker-compose up --build` to start up an environment
 * navigate to `utils/mock-data-loader`
 * run `npm install`
 * run `node re-insert-mocks.js`
 * navigate back to the root directory of the repo
 * run `docker-compose down`
 * run `npm run pipeline` to run a full build and test that confirms you've got a working environment.

NB this code has been developed on Mac OS and runs in Linux containers. You may need to adjust some instructions if you need to run it on Windows.

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

From another terminal, stop everything cleanly with:
```
docker-compose down
```

Portal can then be seen on:
```
http://localhost:5000
```

mock API services are exposed on:
```
http://localhost:5001/
```
(although these endpoints mostly require access tokens to interact with..)
```
http://localhost:5001/v1/deals
```

a mongoDB instance will have been started:
* to connect a client from your local machine, connect to localhost:27017 as root/r00t


### Git workflow

Setup git hooks with:
```
npm install
```

When a commit is pushed to master, heroku branches are updated and pushed.


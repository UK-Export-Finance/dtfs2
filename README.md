# dtfs2

[![Build Status](https://dev.azure.com/sysdevukef/DTFS/_apis/build/status/notbinary.dtfs2?branchName=master)](https://dev.azure.com/sysdevukef/DTFS/_build/latest?definitionId=45&branchName=master)

### Setup

Prerequisites

 * Version 13 or later of `node` and `npm`
 * Docker and Docker Compose

Steps

 * clone this repo
 * if you have a Companies House API key, it can be stored in a one-line text file called `companies_hous_api_key.txt` (named in `.gitignore`). This will be picked up and used by `bin/pipeline.sh`.
 * run `npm install` in the root directory of the repo
 * run `npm run pipeline` to check you've got a working build

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

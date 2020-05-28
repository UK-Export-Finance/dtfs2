# dtfs2

[![Build Status](https://dev.azure.com/sysdevukef/Digital%20IAC/_apis/build/status/notbinary.dtfs2?branchName=master)](https://dev.azure.com/sysdevukef/Digital%20IAC/_build/latest?definitionId=45&branchName=master)


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

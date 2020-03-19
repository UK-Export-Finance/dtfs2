# dtfs2
Placeholder repo

### AWS Bulid badge

![AWS Build badge](https://codebuild.eu-west-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiSCtEaG55WDRnelpIclk4NzAzWWE5ZVp4alB2RHJtQU9rUXgzT2ZaTW1jbDhUd3RLUDFBMGhjTHpocGRlVThzUGxoUXErUUR4cmZFYkFQU3haKzNNT21rPSIsIml2UGFyYW1ldGVyU3BlYyI6IkRTemxBeUhUWDVxSG1IZEEiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

### Testing

With docker running, execute all tests with:
```
npm install && npm run pipeline
```

Note, at time of writing this script does not execute our end to end tests; they don't currently have business value so adding a minute to the script's execution didn't seem helpful. The e2e tests can be run in the meantime with:
```
./execute-e2e-tests.sh
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

mock API services can be seen for eg. on:
```
http://localhost:5001/mocks/contract/2
```

real API services that are interacting with mongoDB can be seen for eg. on:
```
http://localhost:5001/api/deals
```

a mongoDB instance will have been started:
* to connect a client from your local machine, connect to localhost:27017 as root/r00t

### Git workflow

Setup git hooks with:
```
npm install
```

When a commit is pushed to master, heroku branches are updated and pushed.

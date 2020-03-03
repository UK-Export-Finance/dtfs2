# dtfs2
Placeholder repo

### AWS Bulid badge

![AWS Build badge](https://codebuild.eu-west-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiSCtEaG55WDRnelpIclk4NzAzWWE5ZVp4alB2RHJtQU9rUXgzT2ZaTW1jbDhUd3RLUDFBMGhjTHpocGRlVThzUGxoUXErUUR4cmZFYkFQU3haKzNNT21rPSIsIml2UGFyYW1ldGVyU3BlYyI6IkRTemxBeUhUWDVxSG1IZEEiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

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

the API services can be seen for eg. on:
```
http://localhost:5001/mocks/contract/2
```

a mongoDB instance will have been started:
* to connect a client from your local machine, connect to localhost:27017 as <todo>/<todo>
* to connect from within another docker image, connect to dealData:27017, same user/password

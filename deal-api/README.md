# deal-api

## to execute api tests:

in one terminal, launch our dependencies:
```
docker-compose up --build
```

in a second terminal, execute our api tests:
```
npm run api-test
```

test coverage will be generated and can be viewed with (on a mac, anyway..)
```
open ./reports/coverage/api-test/lcov-report/index.html
```

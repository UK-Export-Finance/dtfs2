# k2reader

spike to parse k2 xml files, and push them into our deal service so we can load real data.
this may be throw-away but it forces us to look at the mappings etc.

assumes you have the whole environment running with docker-compose..

to scan everything in ./test-data/type-a-xml and post it to DEAL_API_URL as defined in .env:
```
npm start
```

unit-tests:
```
npm test
```

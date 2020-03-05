# k2reader

spike to parse k2 xml files, and push them into our deal service so we can load real data.
this may be throw-away but it forces us to look at the mappings etc.

assumes you have the whole environment running with docker-compose..

```
npm start
```

will scan everything in ./test-data/type-a-xml and post it to localhost:5001/deal, the endpoint just logs the data.

```
npm test
```

is wired to run all jest tests it can find, and create coverage reports under /reports.

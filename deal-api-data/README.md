# deal-api-data

## this area represents the data service used by deal-api

When a docker-compose is run that causes us to boot the deal-api-data service, any automagical installation/configuration of mongo will be governed by files in this area.

# utilities

```
node ./re-insert-mocks.js
```
will load the mock data we've built the front end against by posting it all to the relevant api
(launch the full docker-compose environment, drop the collection using a db editor, and run the above)

# utilities

at time of writing i'm afraid you have to manually clear down your db; use a client (eg https://robomongo.org) to drop the collections. i'll fix once we've got some delete endpoints in place..


```
node ./re-insert-mocks.js
```

by default this runs against deal-api on localhost

to point it elsewhere update the .env file
